import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getUserPermissions } from "@/lib/auth/rbac";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  restaurantId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password, restaurantId } = validation.data;

    // 1. Find user
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
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Handle Super Admin login via general login form if applicable
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

      return NextResponse.json({
        message: "Super Admin login successful.",
        redirectUrl: "/admin",
        user: { id: user.id, name: user.name, email: user.email, platformRole: user.platformRole },
      });
    }

    // 4. Handle Restaurant Owner / Staff membership
    if (user.staffMemberships.length === 0) {
      return NextResponse.json(
        { error: "Your account is not associated with any active restaurant." },
        { status: 403 }
      );
    }

    // Select restaurant membership
    const activeMembership = restaurantId
      ? user.staffMemberships.find((m) => m.restaurantId === restaurantId) || user.staffMemberships[0]
      : user.staffMemberships[0];

    const activeRestaurant = activeMembership.restaurant;
    const activeRole = activeMembership.role;

    // Load RBAC permissions
    const { permissions } = await getUserPermissions(user.id, activeRestaurant.id);

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 5. Issue Session Cookie
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

    return NextResponse.json({
      message: "Login successful.",
      redirectUrl: "/dashboard",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeRestaurant: { id: activeRestaurant.id, name: activeRestaurant.name, slug: activeRestaurant.slug },
        role: { id: activeRole.id, name: activeRole.name },
      },
    });
  } catch (error) {
    console.error("[User Login Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
