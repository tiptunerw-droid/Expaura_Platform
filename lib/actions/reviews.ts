"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@/generated/prisma/client";

const rating15 = z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5");

const submitReviewSchema = z.object({
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  branchId: z.string().uuid().optional(),
  overallRating: rating15,
  foodRating: rating15.optional(),
  serviceRating: rating15.optional(),
  atmosphereRating: rating15.optional(),
  cleanlinessRating: rating15.optional(),
  wouldRecommend: z.boolean().optional(),
  comment: z.string().optional(),
  tableNumber: z.string().optional(),
});

const listReviewsSchema = z.object({
  restaurantId: z.string().uuid(),
  minRating: rating15.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export async function submitReview(form: z.infer<typeof submitReviewSchema>) {
  const valid = submitReviewSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: valid.data.restaurantId },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { ...valid.data },
    });

    let complaintId: string | undefined;

    if (review.overallRating <= 2 && review.comment) {
      let category = await tx.complaintCategory.findFirst({
        where: { name: { equals: "Service", mode: "insensitive" } },
      });
      if (!category) {
        category = await tx.complaintCategory.findFirst();
      }
      if (category) {
        const complaint = await tx.complaint.create({
          data: {
            reviewId: review.id,
            restaurantId: review.restaurantId,
            branchId: review.branchId,
            categoryId: category.id,
            description: review.comment,
            status: ComplaintStatus.PENDING,
          },
        });
        complaintId = complaint.id;
      }
    }

    return { reviewId: review.id, complaintId };
  });

  return result;
}

export async function listRestaurantReviews(input: z.infer<typeof listReviewsSchema>) {
  const valid = listReviewsSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { restaurantId, minRating, from, to, limit } = valid.data;

  const where: any = { restaurantId };
  if (minRating != null) where.overallRating = { gte: minRating };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  return prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit || 100,
  });
}

export async function getRestaurantReviewsStats(restaurantId: string) {
  const idValid = z.string().uuid().safeParse(restaurantId);
  if (!idValid.success) throw new Error("Invalid restaurant ID");

  const reviews = await prisma.review.findMany({
    where: { restaurantId: idValid.data },
    select: {
      overallRating: true,
      foodRating: true,
      serviceRating: true,
      atmosphereRating: true,
      cleanlinessRating: true,
      wouldRecommend: true,
      createdAt: true,
    },
  });

  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      averageOverall: 0,
      averageFood: 0,
      averageService: 0,
      averageAtmosphere: 0,
      averageCleanliness: 0,
      recommendRate: 0,
      totalReviews: 0,
      reviewsByStar: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviewsLast30Days: 0,
    };
  }

  const avg = (vals: (number | null | undefined)[]) => {
    const valid = vals.filter((v): v is number => typeof v === "number");
    return valid.length ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : 0;
  };

  const reviewsByStar: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    reviewsByStar[r.overallRating] = (reviewsByStar[r.overallRating] || 0) + 1;
  });

  const recommendVals = reviews.filter((r) => r.wouldRecommend !== undefined);
  const recommendRate = recommendVals.length
    ? Math.round((recommendVals.filter((r) => r.wouldRecommend).length / recommendVals.length) * 100)
    : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reviewsLast30Days = reviews.filter((r) => r.createdAt >= thirtyDaysAgo).length;

  return {
    averageOverall: avg(reviews.map((r) => r.overallRating)),
    averageFood: avg(reviews.map((r) => r.foodRating)),
    averageService: avg(reviews.map((r) => r.serviceRating)),
    averageAtmosphere: avg(reviews.map((r) => r.atmosphereRating)),
    averageCleanliness: avg(reviews.map((r) => r.cleanlinessRating)),
    recommendRate,
    totalReviews,
    reviewsByStar,
    reviewsLast30Days,
  };
}
