"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { randomUUID } from "crypto";

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

async function aggregateRatings(restaurantId: string) {
  const reviews = await prisma.review.findMany({
    where: { restaurantId },
    select: {
      overallRating: true,
      foodRating: true,
      serviceRating: true,
      atmosphereRating: true,
      cleanlinessRating: true,
    },
  });

  const count = reviews.length;
  if (count === 0) {
    return {
      averageOverall: 0,
      averageFood: 0,
      averageService: 0,
      averageAtmosphere: 0,
      averageCleanliness: 0,
      reviewCount: 0,
    };
  }

  const sum = reviews.reduce(
    (acc, r) => {
      acc.overall += r.overallRating;
      if (r.foodRating) acc.food += r.foodRating;
      if (r.serviceRating) acc.service += r.serviceRating;
      if (r.atmosphereRating) acc.atmosphere += r.atmosphereRating;
      if (r.cleanlinessRating) acc.cleanliness += r.cleanlinessRating;
      return acc;
    },
    { overall: 0, food: 0, service: 0, atmosphere: 0, cleanliness: 0 }
  );

  const foodN = reviews.filter((r) => r.foodRating != null).length;
  const serviceN = reviews.filter((r) => r.serviceRating != null).length;
  const atmosphereN = reviews.filter((r) => r.atmosphereRating != null).length;
  const cleanlinessN = reviews.filter((r) => r.cleanlinessRating != null).length;

  return {
    averageOverall: round1dp(sum.overall / count),
    averageFood: foodN ? round1dp(sum.food / foodN) : 0,
    averageService: serviceN ? round1dp(sum.service / serviceN) : 0,
    averageAtmosphere: atmosphereN ? round1dp(sum.atmosphere / atmosphereN) : 0,
    averageCleanliness: cleanlinessN ? round1dp(sum.cleanliness / cleanlinessN) : 0,
    reviewCount: count,
  };
}

export async function getPublicRestaurantBySlug(slug: string) {
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
}

export async function getPublicRestaurantByQr(code: string) {
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
}

export async function listDirectory(input: z.infer<typeof listDirectorySchema>) {
  const valid = listDirectorySchema.safeParse(input);
  if (!valid.success) throw new Error(valid.error.issues[0]?.message || "Invalid filters");

  const { cityName, search, minRating } = valid.data;

  const where: any = { isActive: true };
  if (cityName) where.city = { name: { contains: cityName, mode: "insensitive" } };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: { city: true, reviews: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const enriched = await Promise.all(
    restaurants.map(async (r) => {
      const ratings = await aggregateRatings(r.id);
      return { ...r, ...ratings };
    })
  );

  let filtered = enriched;
  if (minRating != null) {
    filtered = enriched.filter((r) => r.averageOverall >= minRating);
  }

  filtered.sort((a, b) => {
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    return b.averageOverall - a.averageOverall;
  });

  return filtered;
}

export async function listRecentlyAdded(limit: number = 12) {
  const limitSchema = z.number().min(1).max(100).default(12);
  const valid = limitSchema.safeParse(limit);
  if (!valid.success) throw new Error("Invalid limit");

  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: valid.data,
  });

  return Promise.all(
    restaurants.map(async (r) => ({
      ...r,
      ...(await aggregateRatings(r.id)),
    }))
  );
}

export async function listFeatured(limit: number = 6) {
  const limitSchema = z.number().min(1).max(100).default(6);
  const valid = limitSchema.safeParse(limit);
  if (!valid.success) throw new Error("Invalid limit");

  const restaurants = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      subscriptions: {
        some: { status: "ACTIVE" },
      },
    },
    include: { city: true },
    take: valid.data * 3,
  });

  const shuffled = restaurants.sort(() => Math.random() - 0.5).slice(0, valid.data);

  return Promise.all(
    shuffled.map(async (r) => ({
      ...r,
      ...(await aggregateRatings(r.id)),
    }))
  );
}

export async function getManagerRestaurant() {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.activeRestaurantId },
    include: {
      city: true,
      branches: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
  });

  if (!restaurant) throw new Error("Restaurant not found");

  return {
    ...restaurant,
    currentSubscription: restaurant.subscriptions[0] || null,
  };
}

export async function updateRestaurantProfile(form: z.infer<typeof updateRestaurantProfileSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = updateRestaurantProfileSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

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
