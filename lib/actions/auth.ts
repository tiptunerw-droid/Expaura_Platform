"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { setSessionCookie, destroySession, getSession } from "@/lib/auth/session";
import { seedDefaultRolesForRestaurant, getUserPermissions } from "@/lib/auth/rbac";
import { SignJWT, jwtVerify } from "jose";
import { sendEmail } from "@/lib/email/brevo";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expaura_super_secret_jwt_key_change_in_production_2026"
);

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  restaurantId: z.string().optional(),
});

export async function login(
  input: z.infer<typeof loginSchema>
): Promise<{
  message: string;
  redirectUrl: string;
  user: {
    id: string;
    name: string;
    email: string;
    platformRole?: string;
    activeRestaurant?: { id: string; name: string; slug: string };
    role?: { id: string; name: string };
  };
}> {
  const validation = loginSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { email, password, restaurantId } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      staffMemberships: {
        where: { isActive: true },
        include: {
          restaurant: true,
          role: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  if (user.platformRole === "SUPER_ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      platformRole: "SUPER_ADMIN",
    });

    return {
      message: "Super Admin login successful.",
      redirectUrl: "/admin",
      user: { id: user.id, name: user.name, email: user.email, platformRole: user.platformRole },
    };
  }

  if (user.staffMemberships.length === 0) {
    throw new Error("Your account is not associated with any active restaurant.");
  }

  const activeMembership = restaurantId
    ? user.staffMemberships.find((m) => m.restaurantId === restaurantId) || user.staffMemberships[0]
    : user.staffMemberships[0];

  const activeRestaurant = activeMembership.restaurant;
  const activeRole = activeMembership.role;

  const { permissions } = await getUserPermissions(user.id, activeRestaurant.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    platformRole: user.platformRole,
    activeRestaurantId: activeRestaurant.id,
    roleId: activeRole.id,
    roleName: activeRole.name,
    permissions,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      restaurantId: activeRestaurant.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
    },
  });

  return {
    message: "Login successful.",
    redirectUrl: "/dashboard",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      activeRestaurant: { id: activeRestaurant.id, name: activeRestaurant.name, slug: activeRestaurant.slug },
      role: { id: activeRole.id, name: activeRole.name },
    },
  };
}

const registerOwnerSchema = z.object({
  name: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  cityId: z.string().uuid("Please select a valid city"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`;
}

export async function registerRestaurantOwner(
  input: z.infer<typeof registerOwnerSchema>
): Promise<{
  message: string;
  redirectUrl: string;
  user: { id: string; name: string; email: string };
  restaurant: { id: string; name: string; slug: string };
}> {
  const validation = registerOwnerSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { name, email, password, restaurantName, cityId, phone, address } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const city = await prisma.city.findUnique({
    where: { id: cityId },
  });

  if (!city) {
    throw new Error("Selected city does not exist.");
  }

  const passwordHash = await hashPassword(password);
  const slug = generateSlug(restaurantName);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        platformRole: "USER",
        isActive: true,
      },
    });

    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        cityId,
        phone,
        address,
        email: email.toLowerCase(),
        isActive: true,
      },
    });

    return { user, restaurant };
  });

  const { ownerRole } = await seedDefaultRolesForRestaurant(result.restaurant.id);

  await prisma.restaurantStaff.create({
    data: {
      userId: result.user.id,
      restaurantId: result.restaurant.id,
      roleId: ownerRole.id,
      isActive: true,
    },
  });

  const { permissions } = await getUserPermissions(result.user.id, result.restaurant.id);

  await setSessionCookie({
    userId: result.user.id,
    email: result.user.email,
    name: result.user.name,
    platformRole: "USER",
    activeRestaurantId: result.restaurant.id,
    roleId: ownerRole.id,
    roleName: ownerRole.name,
    permissions,
  });

  await prisma.auditLog.create({
    data: {
      userId: result.user.id,
      restaurantId: result.restaurant.id,
      action: "RESTAURANT_OWNER_REGISTERED",
      entity: "Restaurant",
      entityId: result.restaurant.id,
    },
  });

  return {
    message: "Restaurant owner registered successfully.",
    redirectUrl: "/dashboard",
    user: { id: result.user.id, name: result.user.name, email: result.user.email },
    restaurant: { id: result.restaurant.id, name: result.restaurant.name, slug: result.restaurant.slug },
  };
}

export async function getCurrentUser(): Promise<{
  authenticated: boolean;
  user?: {
    userId: string;
    email: string;
    name: string;
    platformRole: string;
    activeRestaurantId?: string;
    roleName?: string;
    permissions?: string[];
  };
  restaurant?: { id: string; name: string; slug: string; logoUrl: string | null } | null;
}> {
  const session = await getSession();
  if (!session) {
    return { authenticated: false };
  }

  let restaurant = null;
  if (session.activeRestaurantId) {
    restaurant = await prisma.restaurant.findUnique({
      where: { id: session.activeRestaurantId },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });
  }

  return {
    authenticated: true,
    user: session,
    restaurant,
  };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

const superAdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function superAdminLogin(
  input: z.infer<typeof superAdminLoginSchema>
): Promise<{
  message: string;
  redirectUrl: string;
  user: { id: string; name: string; email: string; role: string };
}> {
  const validation = superAdminLoginSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.platformRole !== "SUPER_ADMIN" || !user.isActive) {
    throw new Error("Invalid credentials or unauthorized access.");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    platformRole: "SUPER_ADMIN",
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "SUPER_ADMIN_LOGIN",
      entity: "User",
      entityId: user.id,
    },
  });

  return {
    message: "Login successful.",
    redirectUrl: "/admin",
    user: { id: user.id, name: user.name, email: user.email, role: user.platformRole },
  };
}

const superAdminRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function isSuperAdminRegistrationAvailable(): Promise<boolean> {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { platformRole: "SUPER_ADMIN" },
  });
  return !existingSuperAdmin;
}

export async function bootstrapSuperAdmin(
  input: z.infer<typeof superAdminRegisterSchema>
): Promise<{
  message: string;
  redirectUrl: string;
  user: { id: string; name: string; email: string };
}> {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { platformRole: "SUPER_ADMIN" },
  });

  if (existingSuperAdmin) {
    throw new Error("Super Admin account already exists. Registration is locked.");
  }

  const validation = superAdminRegisterSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { name, email, password } = validation.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingEmail) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      platformRole: "SUPER_ADMIN",
      isActive: true,
    },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    platformRole: "SUPER_ADMIN",
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "SUPER_ADMIN_BOOTSTRAP_REGISTERED",
      entity: "User",
      entityId: user.id,
    },
  });

  return {
    message: "Super Admin account created successfully.",
    redirectUrl: "/admin",
    user: { id: user.id, name: user.name, email: user.email },
  };
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function forgotPassword(
  input: z.infer<typeof forgotPasswordSchema>
): Promise<{ message: string }> {
  const validation = forgotPasswordSchema.safeParse(input);
  if (!validation.success) {
    throw new Error("Invalid email address.");
  }

  const { email } = validation.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    return {
      message: "If an active account exists with that email, a password reset link has been sent.",
    };
  }

  const token = await new SignJWT({ userId: user.id, email: user.email, type: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const emailResult = await sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: "Expaura Platform — Password Reset Request",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Reset Your Expaura Password</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your Expaura Platform account.</p>
        <p>Click the button below to set a new password. This link will expire in 60 minutes:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (!emailResult.success) {
    console.error("[Forgot Password Email Error]", emailResult.error);
  }

  return {
    message: "If an active account exists with that email, a password reset link has been sent.",
  };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(
  input: z.infer<typeof resetPasswordSchema>
): Promise<{ message: string }> {
  const validation = resetPasswordSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { token, newPassword } = validation.data;

  let payload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
    payload = verified.payload as { userId: string; email: string; type: string };
  } catch {
    throw new Error("Invalid or expired reset token.");
  }

  if (payload.type !== "password_reset" || !payload.userId) {
    throw new Error("Invalid token payload.");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: payload.userId },
    data: { passwordHash },
  });

  await prisma.auditLog.create({
    data: {
      userId: payload.userId,
      action: "PASSWORD_RESET_COMPLETED",
      entity: "User",
      entityId: payload.userId,
    },
  });

  return {
    message: "Password reset successful. You can now login with your new password.",
  };
}
