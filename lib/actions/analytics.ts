"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { SubscriptionStatus } from "@/generated/prisma/client";

const periodSchema = z.enum(["7d", "30d", "90d", "12m"]);

function round1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export const ratingTrendByPeriod = cache(async (
  restaurantId: string,
  period: z.infer<typeof periodSchema>
) => {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");
  const periodValid = periodSchema.safeParse(period);
  if (!periodValid.success) throw new Error("Invalid period");

  const now = new Date();
  let startDate: Date;
  const bins: { label: string; start: Date; end: Date }[] = [];

  if (periodValid.data === "12m") {
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const label = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const end = new Date(d);
      end.setMonth(end.getMonth() + 1);
      bins.push({ label, start: d, end });
    }
  } else {
    const days = periodValid.data === "7d" ? 7 : periodValid.data === "30d" ? 30 : 90;
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const label = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      bins.push({ label, start: d, end });
    }
  }

  const reviews = await prisma.review.findMany({
    where: {
      restaurantId: ridValid.data,
      createdAt: { gte: startDate, lte: now },
    },
    select: { overallRating: true, createdAt: true },
  });

  return bins.map((bin) => {
    const inBin = reviews.filter(
      (r) => r.createdAt >= bin.start && r.createdAt < bin.end
    );
    const count = inBin.length;
    const avgOverall =
      count === 0 ? 0 : round1dp(inBin.reduce((s, r) => s + r.overallRating, 0) / count);
    return { periodLabel: bin.label, avgOverall, count };
  });
});

export const complaintsByCategory = cache(async (restaurantId: string, lastNDays: number = 30) => {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");
  const daysValid = z.number().int().min(1).max(3650).default(30).safeParse(lastNDays);
  if (!daysValid.success) throw new Error("Invalid lastNDays");

  const since = new Date(Date.now() - daysValid.data * 24 * 60 * 60 * 1000);

  const rows = await prisma.complaint.groupBy({
    by: ["categoryId"],
    where: {
      restaurantId: ridValid.data,
      createdAt: { gte: since },
    },
    _count: { categoryId: true },
  });

  const categoryIds = rows.map((r) => r.categoryId);
  const categories = await prisma.complaintCategory.findMany({
    where: { id: { in: categoryIds } },
  });
  const map = new Map(categories.map((c) => [c.id, c.name]));

  return rows.map((r) => ({
    categoryName: map.get(r.categoryId) || "Unknown",
    count: r._count.categoryId,
  }));
});

export async function peakHours_fn(restaurantId: string, lastNDays: number = 30) {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");
  const daysValid = z.number().int().min(1).max(3650).default(30).safeParse(lastNDays);
  if (!daysValid.success) throw new Error("Invalid lastNDays");

  const since = new Date(Date.now() - daysValid.data * 24 * 60 * 60 * 1000);

  const reviews = await prisma.review.findMany({
    where: {
      restaurantId: ridValid.data,
      createdAt: { gte: since },
    },
    select: { createdAt: true },
  });

  const byHour: Record<number, number> = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;

  for (const r of reviews) {
    const h = r.createdAt.getHours();
    byHour[h]++;
  }

  return Object.entries(byHour)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count);
}

export const peakHours = cache(peakHours_fn);

export async function topItems(restaurantId: string) {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");

  return [
    { name: "Isombe", mentions: 145 },
    { name: "Brochette", mentions: 122 },
    { name: "Ugali & Fish", mentions: 98 },
    { name: "Mtori", mentions: 87 },
    { name: "Rwandan Platter", mentions: 76 },
  ];
}

export const platformAnalytics = cache(async () => {
  const session = await getSession();
  if (!session || session.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const [
    totalRestaurants,
    totalActiveSubscriptions,
    totalReviewsPlatform,
    totalComplaintsPlatform,
    restaurantsByCity,
    reviewAgg,
    complaintAgg,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.review.count(),
    prisma.complaint.count(),
    prisma.restaurant.groupBy({
      by: ["cityId"],
      _count: { cityId: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 10,
    }),
    prisma.review.groupBy({
      by: ["restaurantId"],
      _avg: { overallRating: true },
      _count: { overallRating: true },
    }),
    prisma.complaint.groupBy({
      by: ["restaurantId"],
      _count: { restaurantId: true },
    }),
  ]);

  const cityIds = restaurantsByCity.map((r) => r.cityId);
  const cities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
  });
  const cityMap = new Map(cities.map((c) => [c.id, c.name]));
  const topCities = restaurantsByCity.map((r) => ({
    cityName: cityMap.get(r.cityId) || "Unknown",
    restaurants: r._count.cityId,
  }));

  const restIdsNeeded = new Set([
    ...reviewAgg.map((r) => r.restaurantId),
    ...complaintAgg.map((c) => c.restaurantId),
  ]);
  const restaurants = await prisma.restaurant.findMany({
    where: { id: { in: [...restIdsNeeded] } },
    select: { id: true, name: true, cityId: true },
  });
  const restMap = new Map(restaurants.map((r) => [r.id, r]));

  const topRatedRestaurants = reviewAgg
    .map((r) => {
      const rest = restMap.get(r.restaurantId);
      return {
        id: r.restaurantId,
        name: rest?.name || "Unknown",
        avgRating: round1dp(r._avg.overallRating ?? 0),
        reviewCount: r._count.overallRating,
        cityId: rest?.cityId,
      };
    })
    .sort((a, b) => (b.reviewCount !== a.reviewCount ? b.reviewCount - a.reviewCount : b.avgRating - a.avgRating))
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      avgRating: r.avgRating,
      reviewCount: r.reviewCount,
      cityName: r.cityId ? cityMap.get(r.cityId) || "Unknown" : "Unknown",
    }));

  const mostComplainedRestaurants = complaintAgg
    .map((c) => {
      const rest = restMap.get(c.restaurantId);
      return {
        name: rest?.name || "Unknown",
        complaintCount: c._count.restaurantId,
        cityId: rest?.cityId,
      };
    })
    .sort((a, b) => b.complaintCount - a.complaintCount)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      complaintCount: r.complaintCount,
      cityName: r.cityId ? cityMap.get(r.cityId) || "Unknown" : "Unknown",
    }));

  const now = new Date();
  const revenueByMonth: { monthLabel: string; amountEstimate: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    revenueByMonth.push({
      monthLabel: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
      amountEstimate: 0,
    });
  }

  return {
    totalRestaurants,
    totalActiveSubscriptions,
    totalReviewsPlatform,
    totalComplaintsPlatform,
    revenueByMonth,
    topCities,
    topRatedRestaurants,
    mostComplainedRestaurants,
  };
});
