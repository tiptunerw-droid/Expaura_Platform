"use server";

import { z } from "zod";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ComplaintStatus } from "@/generated/prisma/client";
import { createNotification } from "@/lib/actions/notifications";

const submitComplaintSchema = z.object({
  restaurantId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  employeeName: z.string().optional(),
  tableNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
});

const listComplaintsSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  categoryId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ComplaintStatus),
  managerNote: z.string().optional(),
});

export const getComplaintCategories = cache(async () => {
  return prisma.complaintCategory.findMany();
});

export async function submitComplaint(form: z.infer<typeof submitComplaintSchema>) {
  const valid = submitComplaintSchema.safeParse(form);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { employeeName, restaurantId, ...rest } = valid.data;

  let employeeId: string | undefined;
  if (employeeName && employeeName.trim()) {
    const trimmedName = employeeName.trim();
    let employee = await prisma.employee.findFirst({
      where: {
        restaurantId,
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });
    if (!employee) {
      employee = await prisma.employee.create({
        data: { name: trimmedName, restaurantId },
      });
    }
    employeeId = employee.id;
  }

  const complaint = await prisma.complaint.create({
    data: {
      ...rest,
      restaurantId,
      employeeId,
    },
    select: { id: true },
  });

  await createNotification(
    restaurantId,
    "NEW_COMPLAINT",
    "New Complaint Filed",
    rest.description.slice(0, 120),
    `/dashboard/complaints`,
  );

  return { id: complaint.id };
}

export const listRestaurantComplaints = cache(async (input: z.infer<typeof listComplaintsSchema>) => {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = listComplaintsSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { status, categoryId, employeeId, branchId, from, to } = valid.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { restaurantId: session.activeRestaurantId };
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (employeeId) where.employeeId = employeeId;
  if (branchId) where.branchId = branchId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  return prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      employee: true,
      review: true,
    },
  });
});

export async function updateComplaintStatus(input: z.infer<typeof updateStatusSchema>) {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = updateStatusSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { id, status, managerNote } = valid.data;

  const existing = await prisma.complaint.findUnique({
    where: { id },
    select: { restaurantId: true },
  });
  if (!existing || existing.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { status };
  if (managerNote !== undefined) data.managerNote = managerNote;
  if (status === ComplaintStatus.RESOLVED || status === ComplaintStatus.REJECTED) {
    data.resolvedById = session.userId;
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data,
    select: { restaurantId: true },
  });

  if (status === ComplaintStatus.RESOLVED || status === ComplaintStatus.REJECTED) {
    const actionLabel = status === ComplaintStatus.RESOLVED ? "Resolved" : "Rejected";
    await createNotification(
      updated.restaurantId,
      "COMPLAINT_RESOLVED",
      `Complaint ${actionLabel}`,
      managerNote?.slice(0, 120),
      `/dashboard/complaints`,
    );
  }

  return updated;
}

export const getComplaintDetail = cache(async (id: string) => {
  const session = await getSession();
  if (!session || !session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  const valid = z.string().uuid().safeParse(id);
  if (!valid.success) throw new Error("Invalid complaint ID");

  const complaint = await prisma.complaint.findUnique({
    where: { id: valid.data },
    include: {
      category: true,
      employee: true,
      review: true,
      branch: true,
      resolver: { select: { id: true, name: true, email: true } },
    },
  });

  if (!complaint || complaint.restaurantId !== session.activeRestaurantId) {
    throw new Error("Unauthorized");
  }

  return complaint;
});
