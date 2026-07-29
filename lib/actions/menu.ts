"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const addMenuImageSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  branchId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
});

const orderItemSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(0),
});

const updateMenuImageOrderSchema = z.array(orderItemSchema);

export async function listMenuImages(restaurantId: string, branchId?: string) {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");

  if (branchId !== undefined) {
    const bidValid = z.string().uuid().safeParse(branchId);
    if (!bidValid.success) throw new Error("Invalid branch ID");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { restaurantId: ridValid.data };
  if (branchId) where.branchId = branchId;
  if (!branchId) where.branchId = null;

  return prisma.menuImage.findMany({
    where,
    orderBy: { position: "asc" },
  });
}

export async function addMenuImage(form: z.infer<typeof addMenuImageSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = addMenuImageSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  let position = valid.data.position;
  if (position === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { restaurantId: session.activeRestaurantId };
    if (valid.data.branchId) where.branchId = valid.data.branchId;
    else where.branchId = null;

    const maxPos = await prisma.menuImage.aggregate({
      where,
      _max: { position: true },
    });
    position = (maxPos._max.position ?? -1) + 1;
  }

  return prisma.menuImage.create({
    data: {
      imageUrl: valid.data.imageUrl,
      position,
      restaurantId: session.activeRestaurantId,
      branchId: valid.data.branchId,
    },
  });
}

export async function updateMenuImageOrder(order: z.infer<typeof updateMenuImageOrderSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = updateMenuImageOrderSchema.safeParse(order);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  await prisma.$transaction(
    valid.data.map((item) =>
      prisma.menuImage.updateMany({
        where: {
          id: item.id,
          restaurantId: session.activeRestaurantId,
        },
        data: { position: item.position },
      })
    )
  );

  return { success: true };
}

export async function deleteMenuImage(id: string) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) throw new Error("Invalid menu image ID");

  const existing = await prisma.menuImage.findUnique({
    where: { id: valid.data },
    select: { restaurantId: true },
  });
  if (!existing || existing.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  await prisma.menuImage.delete({ where: { id: valid.data } });
  return { success: true };
}
