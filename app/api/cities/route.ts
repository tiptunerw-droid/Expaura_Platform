import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_CITIES = [
  "Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri",
  "Muhanga", "Nyagatare", "Rusizi", "Nyamata", "Rwamagana",
  "Kibuye", "Cyangugu", "Nyanza", "Kibungo", "Ruhango",
];

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, region: true, country: true },
    });

    if (cities.length > 0) {
      return NextResponse.json({ cities });
    }

    // No cities in DB — return fallback with generated IDs
    const fallback = FALLBACK_CITIES.map((name, i) => ({
      id: `fallback-${i}`,
      name,
      region: null,
      country: "Rwanda",
    }));
    return NextResponse.json({ cities: fallback });
  } catch (error) {
    console.error("[Get Cities Error]", error);
    const fallback = FALLBACK_CITIES.map((name, i) => ({
      id: `fallback-${i}`,
      name,
      region: null,
      country: "Rwanda",
    }));
    return NextResponse.json({ cities: fallback });
  }
}
