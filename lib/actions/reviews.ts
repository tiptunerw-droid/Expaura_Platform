"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@/generated/prisma/client";
import { createNotification } from "@/lib/actions/notifications";

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

  await createNotification(
    valid.data.restaurantId,
    "NEW_REVIEW",
    "New Review Submitted",
    valid.data.comment?.slice(0, 120) ?? undefined,
    `/dashboard/reviews`,
  );

  if (result.complaintId) {
    await createNotification(
      valid.data.restaurantId,
      "NEW_COMPLAINT",
      "Auto-flagged Complaint",
      "A low-rated review was automatically escalated",
      `/dashboard/complaints`,
    );
  }

  return result;
}

export const listRestaurantReviews = cache(async (input: z.infer<typeof listReviewsSchema>) => {
  const valid = listReviewsSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { restaurantId, minRating, from, to, limit } = valid.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
});

export const getRestaurantReviewsStats = cache(async (restaurantId: string) => {
  const idValid = z.string().uuid().safeParse(restaurantId);
  if (!idValid.success) throw new Error("Invalid restaurant ID");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [agg, byStar, recommended, withOpinion, last30] = await Promise.all([
    prisma.review.aggregate({
      where: { restaurantId: idValid.data },
      _avg: {
        overallRating: true,
        foodRating: true,
        serviceRating: true,
        atmosphereRating: true,
        cleanlinessRating: true,
      },
      _count: { overallRating: true },
    }),
    prisma.review.groupBy({
      by: ["overallRating"],
      where: { restaurantId: idValid.data },
      _count: { overallRating: true },
    }),
    prisma.review.count({
      where: { restaurantId: idValid.data, wouldRecommend: true },
    }),
    prisma.review.count({
      where: { restaurantId: idValid.data, wouldRecommend: { not: null } },
    }),
    prisma.review.count({
      where: { restaurantId: idValid.data, createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const round1dp = (n: number): number => Math.round(n * 10) / 10;

  const reviewsByStar: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of byStar) {
    reviewsByStar[row.overallRating] = row._count.overallRating;
  }

  return {
    averageOverall: round1dp(agg._avg.overallRating ?? 0),
    averageFood: round1dp(agg._avg.foodRating ?? 0),
    averageService: round1dp(agg._avg.serviceRating ?? 0),
    averageAtmosphere: round1dp(agg._avg.atmosphereRating ?? 0),
    averageCleanliness: round1dp(agg._avg.cleanlinessRating ?? 0),
    recommendRate: withOpinion > 0 ? Math.round((recommended / withOpinion) * 100) : 0,
    totalReviews: agg._count.overallRating,
    reviewsByStar,
    reviewsLast30Days: last30,
  };
});
