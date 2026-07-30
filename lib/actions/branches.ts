"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const addBranchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  address: z.string().optional(),
  cityId: z.string().uuid("Invalid city ID"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  cityId: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().optional(),
});

const assignStaffSchema = z.object({
  staffId: z.string().uuid(),
  branchId: z.string().uuid(),
});

export const listBranches = cache(async (restaurantId: string) => {
  const valid = z.string().uuid().safeParse(restaurantId);
  if (!valid.success) throw new Error("Invalid restaurant ID");

  return prisma.branch.findMany({
    where: { restaurantId: valid.data },
    include: { city: true },
    orderBy: { createdAt: "desc" },
  });
});

export async function addBranch(form: z.infer<typeof addBranchSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = addBranchSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  return prisma.branch.create({
    data: {
      ...valid.data,
      restaurantId: session.activeRestaurantId,
    },
  });
}

export async function updateBranch(id: string, form: z.infer<typeof updateBranchSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const idValid = z.string().uuid().safeParse(id);
  if (!idValid.success) throw new Error("Invalid branch ID");

  const valid = updateBranchSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const existing = await prisma.branch.findUnique({
    where: { id: idValid.data },
    select: { restaurantId: true },
  });
  if (!existing || existing.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  for (const [key, value] of Object.entries(valid.data)) {
    if (value !== undefined) data[key] = value;
  }

  return prisma.branch.update({
    where: { id: idValid.data },
    data,
  });
}

export async function assignStaffToBranch(form: z.infer<typeof assignStaffSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = assignStaffSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  // TODO: RestaurantStaff schema does not carry a branchId column.
  // To enable staff-to-branch assignment, add branchId to the RestaurantStaff model
  // in schema.prisma and re-run prisma generate, then implement upsert here:
  // await prisma.restaurantStaff.updateMany({
  //   where: { id: staffId, restaurantId: session.activeRestaurantId },
  //   data: { branchId },
  // });

  console.log(
    `[assignStaffToBranch] Stub: staff ${valid.data.staffId} -> branch ${valid.data.branchId}`
  );

  return {
    success: true,
    message:
      "Staff-to-branch assignment stubbed. Schema does not support branch on RestaurantStaff yet — see TODO.",
  };
}
