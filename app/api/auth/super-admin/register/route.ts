import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    // 1. Check if a Super Admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { platformRole: "SUPER_ADMIN" },
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: "Super Admin account already exists. Registration is locked." },
        { status: 403 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 3. Check if email is taken
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // 4. Hash password and create Super Admin user
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

    // 5. Create session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      platformRole: "SUPER_ADMIN",
    });

    // 6. Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SUPER_ADMIN_BOOTSTRAP_REGISTERED",
        entity: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Super Admin account created successfully.",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Super Admin Register Error]", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Utility endpoint to check if Super Admin registration is available
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { platformRole: "SUPER_ADMIN" },
  });

  return NextResponse.json({
    isRegistrationAvailable: !existingSuperAdmin,
  });
}
