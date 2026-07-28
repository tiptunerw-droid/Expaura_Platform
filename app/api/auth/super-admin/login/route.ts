import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.platformRole !== "SUPER_ADMIN" || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials or unauthorized access." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Update lastLogin
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

    return NextResponse.json({
      message: "Login successful.",
      user: { id: user.id, name: user.name, email: user.email, role: user.platformRole },
    });
  } catch (error) {
    console.error("[Super Admin Login Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
