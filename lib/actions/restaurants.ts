"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { randomUUID } from "crypto";
import { withDbRetry } from "@/lib/prisma";

const updateRestaurantProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: z.any().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
});

const generateQrSchema = z.object({
  branchId: z.string().uuid().optional(),
});

const listDirectorySchema = z.object({
  cityName: z.string().optional(),
  search: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  cuisine: z.string().optional(),
});

function round1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

type Ratings = {
  averageOverall: number;
  averageFood: number;
  averageService: number;
  averageAtmosphere: number;
  averageCleanliness: number;
  reviewCount: number;
};

function ratingsFromAgg(agg: {
  _avg: {
    overallRating: number | null;
    foodRating: number | null;
    serviceRating: number | null;
    atmosphereRating: number | null;
    cleanlinessRating: number | null;
  };
  _count: { overallRating: number };
}): Ratings {
  return {
    averageOverall: round1dp(agg._avg.overallRating ?? 0),
    averageFood: round1dp(agg._avg.foodRating ?? 0),
    averageService: round1dp(agg._avg.serviceRating ?? 0),
    averageAtmosphere: round1dp(agg._avg.atmosphereRating ?? 0),
    averageCleanliness: round1dp(agg._avg.cleanlinessRating ?? 0),
    reviewCount: agg._count.overallRating,
  };
}

const aggregateRatings = cache(async (restaurantId: string) => {
  const agg = await prisma.review.aggregate({
    where: { restaurantId },
    _avg: {
      overallRating: true,
      foodRating: true,
      serviceRating: true,
      atmosphereRating: true,
      cleanlinessRating: true,
    },
    _count: { overallRating: true },
  });
  return ratingsFromAgg(agg);
});

const batchAggregateRatings = cache(async (restaurantIds: string[]) => {
  if (restaurantIds.length === 0) return new Map<string, Ratings>();

  const rows = await prisma.review.groupBy({
    by: ["restaurantId"],
    where: { restaurantId: { in: restaurantIds } },
    _avg: {
      overallRating: true,
      foodRating: true,
      serviceRating: true,
      atmosphereRating: true,
      cleanlinessRating: true,
    },
    _count: { overallRating: true },
  });

  const grouped = new Map<string, Ratings>();
  for (const row of rows) {
    grouped.set(row.restaurantId, ratingsFromAgg(row));
  }
  return grouped;
});

export const getPublicRestaurantBySlug = cache(async (slug: string) => {
  const slugSchema = z.string().min(1, "Slug is required");
  const valid = slugSchema.safeParse(slug);
  if (!valid.success) throw new Error(valid.error.issues[0]?.message || "Invalid slug");

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: valid.data, isActive: true },
    include: {
      city: true,
    },
  });

  if (!restaurant) throw new Error("Restaurant not found");

  const ratings = await aggregateRatings(restaurant.id);

  return {
    ...restaurant,
    ...ratings,
  };
});

export const getPublicRestaurantByQr = cache(async (code: string) => {
  const codeSchema = z.string().min(1, "QR code is required");
  const valid = codeSchema.safeParse(code);
  if (!valid.success) throw new Error(valid.error.issues[0]?.message || "Invalid QR code");

  const qr = await prisma.qrCode.findUnique({
    where: { code: valid.data, isActive: true },
    include: {
      restaurant: {
        include: { city: true },
      },
      branch: true,
    },
  });

  if (!qr || !qr.restaurant.isActive) throw new Error("Restaurant not found");

  const ratings = await aggregateRatings(qr.restaurantId);

  return {
    ...qr.restaurant,
    branch: qr.branch,
    ...ratings,
  };
});

export const getCityRestaurantCounts = cache(async (): Promise<Record<string, number>> => {
  try {
    const [counts, cities] = await Promise.all([
      prisma.restaurant.groupBy({
        by: ["cityId"],
        where: { isActive: true },
        _count: { id: true },
      }),
      prisma.city.findMany({ select: { id: true, name: true } }),
    ]);
    const cityMap = new Map(cities.map((c) => [c.id, c.name]));
    const result: Record<string, number> = {};
    for (const c of counts) {
      const name = cityMap.get(c.cityId);
      if (name) result[name] = c._count.id;
    }
    return result;
  } catch {
    return {};
  }
});

export const listDirectory = cache(async (input: z.infer<typeof listDirectorySchema>) => {
  const valid = listDirectorySchema.safeParse(input);
  if (!valid.success) throw new Error(valid.error.issues[0]?.message || "Invalid filters");

  const { cityName, search, minRating } = valid.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };
  if (cityName) where.city = { name: { contains: cityName, mode: "insensitive" } };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const ids = restaurants.map((r) => r.id);
  const ratingsMap = ids.length > 0 ? await batchAggregateRatings(ids) : new Map();

  const enriched = restaurants.map((r) => ({
    ...r,
    ...(ratingsMap.get(r.id) ?? { averageOverall: 0, averageFood: 0, averageService: 0, averageAtmosphere: 0, averageCleanliness: 0, reviewCount: 0 }),
  }));

  let filtered = enriched;
  if (minRating != null) {
    filtered = enriched.filter((r) => r.averageOverall >= minRating);
  }

  filtered.sort((a, b) => {
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    return b.averageOverall - a.averageOverall;
  });

  return filtered;
});

export const listRecentlyAdded = cache(async (limit: number = 12) => {
  const limitSchema = z.number().min(1).max(100).default(12);
  const valid = limitSchema.safeParse(limit);
  if (!valid.success) throw new Error("Invalid limit");

  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: valid.data,
  });

  const ids = restaurants.map((r) => r.id);
  const ratingsMap = ids.length > 0 ? await batchAggregateRatings(ids) : new Map();

  return restaurants.map((r) => ({
    ...r,
    ...(ratingsMap.get(r.id) ?? { averageOverall: 0, averageFood: 0, averageService: 0, averageAtmosphere: 0, averageCleanliness: 0, reviewCount: 0 }),
  }));
});

export const listFeatured = cache(async (limit: number = 6) => {
  const limitSchema = z.number().min(1).max(100).default(6);
  const valid = limitSchema.safeParse(limit);
  if (!valid.success) throw new Error("Invalid limit");

  const subscribed = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      subscriptions: {
        some: { status: "ACTIVE" },
      },
    },
    include: { city: true },
    take: valid.data * 3,
  });

  let picks = subscribed;
  if (picks.length > 0) {
    picks = picks.sort(() => Math.random() - 0.5).slice(0, valid.data);
  } else {
    picks = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: { city: true },
      orderBy: { createdAt: "desc" },
      take: valid.data,
    });
  }

  const ids = picks.map((r) => r.id);
  const ratingsMap = ids.length > 0 ? await batchAggregateRatings(ids) : new Map();

  return picks.map((r) => ({
    ...r,
    ...(ratingsMap.get(r.id) ?? { averageOverall: 0, averageFood: 0, averageService: 0, averageAtmosphere: 0, averageCleanliness: 0, reviewCount: 0 }),
  }));
});

export const getManagerRestaurant = cache(async () => {  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await withDbRetry(() =>
    prisma.restaurant.findUnique({
      where: { id: session.activeRestaurantId },
      include: {
        city: true,
        branches: true,
        qrCodes: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    })
  );

  if (!restaurant) throw new Error("Restaurant not found");

  return {
    ...restaurant,
    currentSubscription: restaurant.subscriptions[0] || null,
  };
});

export const getManagerPlanFeatures = cache(async () => {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await withDbRetry(() =>
    prisma.restaurant.findUnique({
      where: { id: session.activeRestaurantId },
      select: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    })
  );

  const plan = restaurant?.subscriptions[0]?.plan ?? null;

  return {
    planName: plan?.name ?? "Free",
    analyticsEnabled: plan?.analyticsEnabled ?? false,
    aiSummaryEnabled: plan?.aiSummaryEnabled ?? false,
    complaintsEnabled: plan?.complaintsEnabled ?? false,
    employeeTrackingEnabled: plan?.employeeTrackingEnabled ?? false,
  };
});

export async function updateRestaurantProfile(form: z.infer<typeof updateRestaurantProfileSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = updateRestaurantProfileSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  for (const [key, value] of Object.entries(valid.data)) {
    if (value !== undefined) data[key] = value;
  }

  return prisma.restaurant.update({
    where: { id: session.activeRestaurantId },
    data,
  });
}

export async function generateRestaurantQr(form: z.infer<typeof generateQrSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = generateQrSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const code = randomUUID();
  const qr = await prisma.qrCode.create({
    data: {
      code,
      isActive: true,
      restaurantId: session.activeRestaurantId,
      branchId: valid.data.branchId,
    },
    select: { id: true, code: true },
  });

  return qr;
}
