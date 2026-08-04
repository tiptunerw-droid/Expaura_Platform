"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const setStatusSchema = z.object({
  restaurantId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function setRestaurantStatus(input: z.infer<typeof setStatusSchema>) {
  const session = await requireSuperAdmin();
  const valid = setStatusSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: valid.data.restaurantId },
    data: { isActive: valid.data.isActive },
    select: { id: true, name: true, slug: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      restaurantId: restaurant.id,
      action: valid.data.isActive ? "RESTAURANT_ACTIVATED" : "RESTAURANT_DEACTIVATED",
      entity: "Restaurant",
      entityId: restaurant.id,
      changes: { isActive: valid.data.isActive },
    },
  });

  revalidatePath("/admin/restaurants");
  revalidatePath("/directory");
  revalidatePath("/");
  revalidatePath(`/r/${restaurant.slug}`);

  return restaurant;
}

const revokeSchema = z.object({
  restaurantId: z.string().uuid(),
});

export async function revokeRestaurant(input: z.infer<typeof revokeSchema>) {
  const session = await requireSuperAdmin();
  const valid = revokeSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.update({
      where: { id: valid.data.restaurantId },
      data: { isActive: false },
      select: { id: true, name: true, slug: true },
    });

    const cancelled = await tx.subscription.updateMany({
      where: { restaurantId: restaurant.id, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });

    return { restaurant, cancelledCount: cancelled.count };
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      restaurantId: result.restaurant.id,
      action: "RESTAURANT_REVOKED",
      entity: "Restaurant",
      entityId: result.restaurant.id,
      changes: { isActive: false, cancelledSubscriptions: result.cancelledCount },
    },
  });

  revalidatePath("/admin/restaurants");
  revalidatePath("/directory");
  revalidatePath("/");
  revalidatePath(`/r/${result.restaurant.slug}`);

  return result;
}
