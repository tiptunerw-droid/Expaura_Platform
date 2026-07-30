"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface City {
  id: string;
  name: string;
  region: string | null;
  country: string;
}

export const getCities = cache(async (): Promise<{ cities: City[] }> => {
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
});
