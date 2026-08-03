"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "PENDING",
  "PAUSED",
] as const;

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const planSchema = z.object({
  name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(60),
  priceMonthly: z.coerce.number().min(0, "Monthly price cannot be negative"),
  maxBranches: z.coerce.number().int().min(1, "Max branches must be at least 1"),
  maxStaff: z.coerce.number().int().min(0, "Max staff cannot be negative"),
  analyticsEnabled: z.boolean().optional(),
  aiSummaryEnabled: z.boolean().optional(),
  complaintsEnabled: z.boolean().optional(),
  employeeTrackingEnabled: z.boolean().optional(),
});

const planUpdateSchema = planSchema.extend({
  id: z.string().uuid(),
});

const planDeleteSchema = z.object({
  id: z.string().uuid(),
});

const subscriptionSchema = z.object({
  restaurantId: z.string().uuid(),
  planId: z.string().uuid(),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  status: z.enum(SUBSCRIPTION_STATUSES),
});

const subscriptionUpdateSchema = subscriptionSchema.extend({
  id: z.string().uuid(),
});

const subscriptionDeleteSchema = z.object({
  id: z.string().uuid(),
});

export async function getAdminSubscriptionData() {
  await requireSuperAdmin();

  const [subscriptions, plans, restaurants] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        restaurant: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true, priceMonthly: true } },
        recorder: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { priceMonthly: "asc" },
    }),
    prisma.restaurant.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const expired = subscriptions.filter((s) => s.status === "EXPIRED").length;
  const pending = subscriptions.filter(
    (s) => s.status === "PENDING" || s.status === "PAUSED"
  ).length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + Number(s.plan.priceMonthly), 0);

  return {
    stats: { active, expired, pending, monthlyRevenue },
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      priceMonthly: Number(p.priceMonthly),
      maxBranches: p.maxBranches,
      maxStaff: p.maxStaff,
      analyticsEnabled: p.analyticsEnabled,
      aiSummaryEnabled: p.aiSummaryEnabled,
      complaintsEnabled: p.complaintsEnabled,
      employeeTrackingEnabled: p.employeeTrackingEnabled,
      subscriptionCount: p._count.subscriptions,
    })),
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      restaurantId: s.restaurantId,
      restaurantName: s.restaurant.name,
      planId: s.planId,
      planName: s.plan.name,
      priceMonthly: Number(s.plan.priceMonthly),
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      status: s.status,
      recordedByName: s.recorder?.name ?? null,
      createdAt: s.createdAt,
    })),
    restaurants,
  };
}

export async function createPlan(input: z.infer<typeof planSchema>) {
  const session = await requireSuperAdmin();
  const valid = planSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { name, priceMonthly, maxBranches, maxStaff, ...toggles } = valid.data;

  const existing = await prisma.plan.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    throw new Error("A plan with that name already exists");
  }

  const plan = await prisma.plan.create({
    data: {
      name,
      priceMonthly,
      maxBranches,
      maxStaff,
      analyticsEnabled: toggles.analyticsEnabled ?? false,
      aiSummaryEnabled: toggles.aiSummaryEnabled ?? false,
      complaintsEnabled: toggles.complaintsEnabled ?? false,
      employeeTrackingEnabled: toggles.employeeTrackingEnabled ?? false,
    },
    select: { id: true, name: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "PLAN_CREATE",
      entity: "Plan",
      entityId: plan.id,
      changes: valid.data,
    },
  });

  return plan;
}

export async function updatePlan(input: z.infer<typeof planUpdateSchema>) {
  const session = await requireSuperAdmin();
  const valid = planUpdateSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { id, name, priceMonthly, maxBranches, maxStaff, ...toggles } = valid.data;

  const existing = await prisma.plan.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Plan not found");
  }

  const duplicate = await prisma.plan.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) {
    throw new Error("A plan with that name already exists");
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      name,
      priceMonthly,
      maxBranches,
      maxStaff,
      analyticsEnabled: toggles.analyticsEnabled ?? false,
      aiSummaryEnabled: toggles.aiSummaryEnabled ?? false,
      complaintsEnabled: toggles.complaintsEnabled ?? false,
      employeeTrackingEnabled: toggles.employeeTrackingEnabled ?? false,
    },
    select: { id: true, name: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "PLAN_UPDATE",
      entity: "Plan",
      entityId: updated.id,
      changes: valid.data,
    },
  });

  return updated;
}

export async function deletePlan(input: z.infer<typeof planDeleteSchema>) {
  const session = await requireSuperAdmin();
  const valid = planDeleteSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const existing = await prisma.plan.findUnique({
    where: { id: valid.data.id },
    include: { _count: { select: { subscriptions: true } } },
  });
  if (!existing) {
    throw new Error("Plan not found");
  }
  if (existing._count.subscriptions > 0) {
    throw new Error(
      `Cannot delete — ${existing._count.subscriptions} subscription(s) reference this plan.`
    );
  }

  await prisma.plan.delete({ where: { id: valid.data.id } });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "PLAN_DELETE",
      entity: "Plan",
      entityId: valid.data.id,
    },
  });
}

function toDate(value: string) {
  return new Date(value);
}

export async function createSubscription(input: z.infer<typeof subscriptionSchema>) {
  const session = await requireSuperAdmin();
  const valid = subscriptionSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const periodStart = toDate(valid.data.periodStart);
  const periodEnd = toDate(valid.data.periodEnd);
  if (periodEnd <= periodStart) {
    throw new Error("Period end must be after period start");
  }

  const subscription = await prisma.subscription.create({
    data: {
      restaurantId: valid.data.restaurantId,
      planId: valid.data.planId,
      periodStart,
      periodEnd,
      status: valid.data.status,
      recordedById: session.userId,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "SUBSCRIPTION_CREATE",
      entity: "Subscription",
      entityId: subscription.id,
      changes: valid.data,
    },
  });

  return subscription;
}

export async function updateSubscription(input: z.infer<typeof subscriptionUpdateSchema>) {
  const session = await requireSuperAdmin();
  const valid = subscriptionUpdateSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const { id, ...fields } = valid.data;
  const periodStart = toDate(fields.periodStart);
  const periodEnd = toDate(fields.periodEnd);
  if (periodEnd <= periodStart) {
    throw new Error("Period end must be after period start");
  }

  const existing = await prisma.subscription.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Subscription not found");
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      restaurantId: fields.restaurantId,
      planId: fields.planId,
      periodStart,
      periodEnd,
      status: fields.status,
    },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "SUBSCRIPTION_UPDATE",
      entity: "Subscription",
      entityId: updated.id,
      changes: valid.data,
    },
  });

  return updated;
}

export async function deleteSubscription(input: z.infer<typeof subscriptionDeleteSchema>) {
  const session = await requireSuperAdmin();
  const valid = subscriptionDeleteSchema.safeParse(input);
  if (!valid.success) {
    throw new Error(valid.error.issues[0]?.message || "Validation failed");
  }

  const existing = await prisma.subscription.findUnique({
    where: { id: valid.data.id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Subscription not found");
  }

  await prisma.subscription.delete({ where: { id: valid.data.id } });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "SUBSCRIPTION_DELETE",
      entity: "Subscription",
      entityId: valid.data.id,
    },
  });
}
