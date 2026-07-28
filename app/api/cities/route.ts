import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        region: true,
        country: true,
      },
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[Get Cities Error]", error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
