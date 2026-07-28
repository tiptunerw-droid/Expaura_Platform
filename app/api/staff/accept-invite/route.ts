import { NextResponse } from "next/server";
import { z } from "zod";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getUserPermissions } from "@/lib/auth/rbac";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expaura_super_secret_jwt_key_change_in_production_2026"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = acceptInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { token, name, password } = validation.data;

    // Verify token
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
      return NextResponse.json(
        { error: "Invalid or expired invitation token." },
        { status: 400 }
      );
    }

    if (payload.type !== "staff_invite" || !payload.restaurantId || !payload.roleId) {
      return NextResponse.json(
        { error: "Invalid invitation token." },
        { status: 400 }
      );
    }

    // Check if user already exists or create new user
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
      // Update password and name if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, passwordHash, isActive: true },
      });
    }

    // Create or update RestaurantStaff link
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

    // Fetch permissions
    const { permissions } = await getUserPermissions(user.id, payload.restaurantId);

    // Issue session cookie
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

    return NextResponse.json({
      message: "Invitation accepted successfully.",
      user: { id: user.id, name: user.name, email: user.email },
      restaurant: { id: staffRecord.restaurant.id, name: staffRecord.restaurant.name },
    });
  } catch (error) {
    console.error("[Accept Invite Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
