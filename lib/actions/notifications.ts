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

function isPlatformAdmin(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  return session.platformRole === "SUPER_ADMIN" || session.platformRole === "ADMIN";
}

export async function getNotifications(limit = 10) {
  const session = await getSession();
  if (!session) return [];
  if (!session.activeRestaurantId && !isPlatformAdmin(session)) return [];

  const where = session.activeRestaurantId
    ? { restaurantId: session.activeRestaurantId }
    : {};

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { restaurant: { select: { name: true } } },
  });
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;
  if (!session.activeRestaurantId && !isPlatformAdmin(session)) return 0;

  const where = session.activeRestaurantId
    ? { restaurantId: session.activeRestaurantId }
    : {};

  return prisma.notification.count({ where: { ...where, isRead: false } });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return;
  if (!session.activeRestaurantId && !isPlatformAdmin(session)) return;

  await prisma.notification.updateMany({
    where: session.activeRestaurantId
      ? { id, restaurantId: session.activeRestaurantId }
      : { id },
    data: { isRead: true },
  });

  revalidatePath("/", "layout");
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return;
  if (!session.activeRestaurantId && !isPlatformAdmin(session)) return;

  await prisma.notification.updateMany({
    where: session.activeRestaurantId
      ? { restaurantId: session.activeRestaurantId, isRead: false }
      : { isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/", "layout");
}
