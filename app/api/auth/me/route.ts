import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let restaurant = null;
  if (session.activeRestaurantId) {
    restaurant = await prisma.restaurant.findUnique({
      where: { id: session.activeRestaurantId },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
    restaurant,
  });
}
