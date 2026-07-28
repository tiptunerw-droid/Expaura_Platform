import { NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/brevo";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expaura_super_secret_jwt_key_change_in_production_2026"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always respond with success to prevent account enumeration
    if (!user || !user.isActive) {
      return NextResponse.json({
        message: "If an active account exists with that email, a password reset link has been sent.",
      });
    }

    // Generate reset token valid for 1 hour
    const token = await new SignJWT({ userId: user.id, email: user.email, type: "password_reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Send email via Brevo HTTP API
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

    return NextResponse.json({
      message: "If an active account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
