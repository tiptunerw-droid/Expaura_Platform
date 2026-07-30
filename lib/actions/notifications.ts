"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification(
  restaurantId: string,
  type: NotificationType,
  title: string,
  message?: string,
  link?: string,
) {
  await prisma.notification.create({
    data: { restaurantId, type, title, message, link },
  });
}

export async function getNotifications(limit = 10) {
  const session = await getSession();
  if (!session?.activeRestaurantId) return [];

  return prisma.notification.findMany({
    where: { restaurantId: session.activeRestaurantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session?.activeRestaurantId) return 0;

  return prisma.notification.count({
    where: { restaurantId: session.activeRestaurantId, isRead: false },
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session?.activeRestaurantId) return;

  await prisma.notification.updateMany({
    where: { id, restaurantId: session.activeRestaurantId },
    data: { isRead: true },
  });

  revalidatePath("/dashboard", "layout");
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session?.activeRestaurantId) return;

  await prisma.notification.updateMany({
    where: { restaurantId: session.activeRestaurantId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/dashboard", "layout");
}
