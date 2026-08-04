"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import { ComplaintStatus } from "@/generated/prisma/client";

const addEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  photoUrl: z.string().optional(),
  jobTitle: z.string().optional(),
  branchId: z.string().uuid().optional(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  photoUrl: z.string().optional(),
  jobTitle: z.string().optional(),
  branchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const listEmployees = cache(async (restaurantId: string) => {
  const valid = z.string().uuid().safeParse(restaurantId);
  if (!valid.success) throw new Error("Invalid restaurant ID");

  const employees = await prisma.employee.findMany({
    where: { restaurantId: valid.data },
    include: {
      complaints: {
        where: {
          status: { in: [ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS] },
        },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return employees.map((e) => ({
    ...e,
    pendingComplaints: e.complaints.length,
  }));
});

export const listActiveEmployees = cache(async (restaurantId: string) => {
  const valid = z.string().uuid().safeParse(restaurantId);
  if (!valid.success) throw new Error("Invalid restaurant ID");

  return prisma.employee.findMany({
    where: { restaurantId: valid.data, isActive: true },
    select: { id: true, name: true, jobTitle: true },
    orderBy: { name: "asc" },
  });
});

export async function addEmployee(form: z.infer<typeof addEmployeeSchema>) {
  const session = await requirePermission("MANAGE_EMPLOYEES");
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = addEmployeeSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  return prisma.employee.create({
    data: {
      ...valid.data,
      restaurantId: session.activeRestaurantId,
    },
  });
}

export async function updateEmployee(id: string, form: z.infer<typeof updateEmployeeSchema>) {
  const session = await requirePermission("MANAGE_EMPLOYEES");
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const idValid = z.string().uuid().safeParse(id);
  if (!idValid.success) throw new Error("Invalid employee ID");

  const valid = updateEmployeeSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const existing = await prisma.employee.findUnique({
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

  return prisma.employee.update({
    where: { id: idValid.data },
    data,
  });
}

export const getEmployeePerformance = cache(async (id: string) => {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) throw new Error("Invalid employee ID");

  const employee = await prisma.employee.findUnique({
    where: { id: valid.data },
    include: {
      complaints: {
        include: { category: true },
      },
    },
  });

  if (!employee || employee.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const totalComplaints = employee.complaints.length;
  const totalResolved = employee.complaints.filter(
    (c) => c.status === ComplaintStatus.RESOLVED
  ).length;
  const totalPending = employee.complaints.filter(
    (c) => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.IN_PROGRESS
  ).length;

  const complaintCountByCategory: Record<string, number> = {};
  for (const c of employee.complaints) {
    const name = c.category?.name || "Unknown";
    complaintCountByCategory[name] = (complaintCountByCategory[name] || 0) + 1;
  }

  const positiveMentions = await prisma.review.count({
    where: {
      restaurantId: session.activeRestaurantId,
      overallRating: { gte: 4 },
      comment: { not: null, contains: employee.name, mode: "insensitive" },
    },
  });

  return {
    totalComplaints,
    totalResolved,
    totalPending,
    complaintCountByCategory,
    positiveMentions,
  };
});
