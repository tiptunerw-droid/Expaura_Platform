"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getCitiesData() {
  const session = await getSession();
  if (!session || session.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const [cities, categories] = await Promise.all([
    prisma.city.findMany({
      include: { _count: { select: { restaurants: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.complaintCategory.findMany({
      include: { _count: { select: { complaints: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    cities: cities.map((c) => ({
      id: c.id,
      name: c.name,
      region: c.region,
      country: c.country,
      restaurantCount: c._count.restaurants,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      complaintCount: c._count.complaints,
    })),
  };
}
