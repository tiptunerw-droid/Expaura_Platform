import { NextResponse } from "next/server";
import { z } from "zod";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expaura_super_secret_jwt_key_change_in_production_2026"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { token, newPassword } = validation.data;

    // Verify token
    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
      payload = verified.payload as { userId: string; email: string; type: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    if (payload.type !== "password_reset" || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid token payload." },
        { status: 400 }
      );
    }

    // Update user password
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

    return NextResponse.json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
