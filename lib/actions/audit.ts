"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getAuditLogs() {
  const session = await getSession();
  if (!session || session.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true } },
      restaurant: { select: { id: true, name: true } },
    },
  });
}
