import { NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/brevo";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().uuid("Please select a valid role"),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ""
);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.activeRestaurantId) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, roleId } = validation.data;

    // Verify role belongs to current restaurant
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        restaurantId: session.activeRestaurantId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found for this restaurant." },
        { status: 404 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.activeRestaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    // Generate invite token valid for 7 days
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

    // Send email via Brevo HTTP API
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

    return NextResponse.json({
      message: `Invitation email sent to ${email}`,
      inviteUrl, // Included in response for convenience in testing
    });
  } catch (error) {
    console.error("[Invite Staff Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
