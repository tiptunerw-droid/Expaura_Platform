"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const addGallerySchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  caption: z.string().optional(),
});

const updateGallerySchema = z.object({
  caption: z.string().optional(),
});

export async function listGallery(restaurantId: string) {
  const valid = z.string().uuid().safeParse(restaurantId);
  if (!valid.success) throw new Error("Invalid restaurant ID");

  return prisma.gallery.findMany({
    where: { restaurantId: valid.data },
    orderBy: { createdAt: "desc" },
  });
}

export async function addGalleryImage(form: z.infer<typeof addGallerySchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = addGallerySchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  return prisma.gallery.create({
    data: {
      ...valid.data,
      restaurantId: session.activeRestaurantId,
    },
  });
}

export async function updateGalleryImage(id: string, form: z.infer<typeof updateGallerySchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const idValid = z.string().uuid().safeParse(id);
  if (!idValid.success) throw new Error("Invalid gallery ID");

  const valid = updateGallerySchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const existing = await prisma.gallery.findUnique({
    where: { id: idValid.data },
    select: { restaurantId: true },
  });
  if (!existing || existing.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (valid.data.caption !== undefined) data.caption = valid.data.caption;

  return prisma.gallery.update({
    where: { id: idValid.data },
    data,
  });
}

export async function deleteGalleryImage(id: string) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) throw new Error("Invalid gallery ID");

  const existing = await prisma.gallery.findUnique({
    where: { id: valid.data },
    select: { restaurantId: true },
  });
  if (!existing || existing.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  await prisma.gallery.delete({ where: { id: valid.data } });
  return { success: true };
}
