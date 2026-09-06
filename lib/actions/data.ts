"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isDbUnavailable } from "@/lib/graceful";

export interface City {
  id: string;
  name: string;
  region: string | null;
  country: string;
}

export const getCities = cache(async (): Promise<{ cities: City[]; dbError: boolean }> => {
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

    return { cities, dbError: false };
  } catch (error) {
    if (isDbUnavailable(error)) return { cities: [], dbError: true };
    console.error("[Get Cities Error]", error);
    return { cities: [], dbError: false };
  }
});
