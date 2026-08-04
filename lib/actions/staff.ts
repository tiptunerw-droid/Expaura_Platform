"use server";

import { z } from "zod";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie, getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import { getUserPermissions } from "@/lib/auth/rbac";
import { sendEmail } from "@/lib/email/brevo";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expaura_super_secret_jwt_key_change_in_production_2026"
);

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().uuid("Please select a valid role"),
});

export const listRestaurantRoles = cache(async () => {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  return prisma.role.findMany({
    where: { restaurantId: session.activeRestaurantId },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });
});

export async function inviteStaff(
  input: z.infer<typeof inviteSchema>
): Promise<{ message: string; inviteUrl: string }> {
  const session = await requirePermission("MANAGE_STAFF");
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized access.");
  }

  const validation = inviteSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { email, roleId } = validation.data;

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      restaurantId: session.activeRestaurantId,
    },
  });

  if (!role) {
    throw new Error("Role not found for this restaurant.");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.activeRestaurantId },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const token = await new SignJWT({
    email: email.toLowerCase(),
    restaurantId: restaurant.id,
    roleId: role.id,
    invitedById: session.userId,
    type: "staff_invite",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/accept-invite?token=${encodeURIComponent(token)}`;

  const emailResult = await sendEmail({
    toEmail: email,
    subject: `You've been invited to join ${restaurant.name} on Expaura`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Invitation to join ${restaurant.name}</h2>
        <p>Hello,</p>
        <p>You have been invited by <strong>${session.name}</strong> to join the team at <strong>${restaurant.name}</strong> as a <strong>${role.name}</strong> on the Expaura Platform.</p>
        <p>Click the button below to accept the invitation and set up your account:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="font-size: 13px; color: #666;">This invitation link will expire in 7 days.</p>
      </div>
    `,
  });

  if (!emailResult.success) {
    console.error("[Invite Staff Email Error]", emailResult.error);
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      restaurantId: restaurant.id,
      action: "STAFF_INVITED",
      entity: "RestaurantStaff",
      changes: { email, roleName: role.name },
    },
  });

  return {
    message: `Invitation email sent to ${email}`,
    inviteUrl,
  };
}

const setStaffStatusSchema = z.object({
  staffId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function setStaffStatus(
  input: z.infer<typeof setStaffStatusSchema>
): Promise<{ message: string }> {
  const session = await requirePermission("MANAGE_STAFF");
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = setStaffStatusSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { staffId, isActive } = valid.data;

  const record = await prisma.restaurantStaff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      userId: true,
      restaurantId: true,
      user: { select: { name: true } },
      role: { select: { name: true } },
    },
  });

  if (!record || record.restaurantId !== session.activeRestaurantId) {
    throw new Error("Staff member not found");
  }
  if (record.userId === session.userId) {
    throw new Error("You cannot change your own access.");
  }

  await prisma.restaurantStaff.update({
    where: { id: record.id },
    data: { isActive },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      restaurantId: session.activeRestaurantId,
      action: isActive ? "STAFF_ACCESS_GRANTED" : "STAFF_ACCESS_REVOKED",
      entity: "RestaurantStaff",
      entityId: record.id,
      changes: { name: record.user.name, role: record.role.name, isActive },
    },
  });

  revalidatePath("/dashboard/staff");

  return { message: isActive ? "Access granted." : "Access revoked." };
}

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function acceptStaffInvite(
  input: z.infer<typeof acceptInviteSchema>
): Promise<{
  message: string;
  redirectUrl: string;
  user: { id: string; name: string; email: string };
  restaurant: { id: string; name: string };
}> {
  const validation = acceptInviteSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(firstIssue?.message || "Validation failed");
  }

  const { token, name, password } = validation.data;

  let payload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
    payload = verified.payload as {
      email: string;
      restaurantId: string;
      roleId: string;
      invitedById: string;
      type: string;
    };
  } catch {
    throw new Error("Invalid or expired invitation token.");
  }

  if (payload.type !== "staff_invite" || !payload.restaurantId || !payload.roleId) {
    throw new Error("Invalid invitation token.");
  }

  let user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  const passwordHash = await hashPassword(password);

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email: payload.email.toLowerCase(),
        passwordHash,
        platformRole: "USER",
        isActive: true,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name, passwordHash, isActive: true },
    });
  }

  const staffRecord = await prisma.restaurantStaff.upsert({
    where: {
      userId_restaurantId: {
        userId: user.id,
        restaurantId: payload.restaurantId,
      },
    },
    update: {
      roleId: payload.roleId,
      isActive: true,
    },
    create: {
      userId: user.id,
      restaurantId: payload.restaurantId,
      roleId: payload.roleId,
      invitedById: payload.invitedById,
      isActive: true,
    },
    include: {
      role: true,
      restaurant: true,
    },
  });

  const { permissions } = await getUserPermissions(user.id, payload.restaurantId);

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    platformRole: user.platformRole,
    activeRestaurantId: payload.restaurantId,
    roleId: staffRecord.roleId,
    roleName: staffRecord.role.name,
    permissions,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      restaurantId: payload.restaurantId,
      action: "STAFF_INVITE_ACCEPTED",
      entity: "RestaurantStaff",
      entityId: staffRecord.id,
    },
  });

  return {
    message: "Invitation accepted successfully.",
    redirectUrl: "/dashboard",
    user: { id: user.id, name: user.name, email: user.email },
    restaurant: { id: staffRecord.restaurant.id, name: staffRecord.restaurant.name },
  };
}
