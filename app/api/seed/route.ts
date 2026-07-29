import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CITIES = [
  { name: "Kigali", region: "Kigali", country: "Rwanda" },
  { name: "Butare", region: "Southern", country: "Rwanda" },
  { name: "Gisenyi", region: "Western", country: "Rwanda" },
  { name: "Musanze", region: "Northern", country: "Rwanda" },
  { name: "Ruhengeri", region: "Northern", country: "Rwanda" },
  { name: "Muhanga", region: "Southern", country: "Rwanda" },
  { name: "Nyagatare", region: "Eastern", country: "Rwanda" },
  { name: "Rusizi", region: "Western", country: "Rwanda" },
  { name: "Nyamata", region: "Eastern", country: "Rwanda" },
  { name: "Rwamagana", region: "Eastern", country: "Rwanda" },
];

export async function GET() {
  try {
    const created: string[] = [];
    for (const city of CITIES) {
      const existing = await prisma.city.findFirst({ where: { name: city.name } });
      if (existing) {
        created.push(`${city.name} (exists)`);
      } else {
        await prisma.city.create({ data: city });
        created.push(city.name);
      }
    }
    return NextResponse.json({ message: `Seeded ${created.length} cities`, cities: created });
  } catch (error) {
    console.error("[Seed Error]", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
