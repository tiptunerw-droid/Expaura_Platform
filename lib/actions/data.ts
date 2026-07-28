"use server";

import { prisma } from "@/lib/prisma";

export interface City {
  id: string;
  name: string;
  region: string | null;
  country: string;
}

export async function getCities(): Promise<{ cities: City[] }> {
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

    return { cities };
  } catch (error) {
    console.error("[Get Cities Error]", error);
    return { cities: [] };
  }
}
