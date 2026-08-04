import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const PERMISSIONS = [
  "VIEW_MENU",
  "MANAGE_MENU",
  "VIEW_GALLERY",
  "MANAGE_GALLERY",
  "VIEW_REVIEWS",
  "VIEW_COMPLAINTS",
  "MANAGE_COMPLAINTS",
  "VIEW_EMPLOYEES",
  "MANAGE_EMPLOYEES",
  "VIEW_STAFF",
  "MANAGE_STAFF",
  "VIEW_ANALYTICS",
  "MANAGE_BRANCHES",
  "MANAGE_QR",
  "MANAGE_SETTINGS",
  "VIEW_BILLING",
  "MANAGE_ROLES",
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number];

const VIEW_CODES = PERMISSIONS.filter((p) => p.startsWith("VIEW_"));

export const ROLE_PERMISSION_SETS: Record<string, PermissionCode[]> = {
  Owner: [...PERMISSIONS],
  Manager: [
    "VIEW_MENU",
    "MANAGE_MENU",
    "VIEW_GALLERY",
    "MANAGE_GALLERY",
    "VIEW_REVIEWS",
    "VIEW_COMPLAINTS",
    "MANAGE_COMPLAINTS",
    "VIEW_EMPLOYEES",
    "MANAGE_EMPLOYEES",
    "VIEW_STAFF",
    "VIEW_ANALYTICS",
    "MANAGE_BRANCHES",
    "MANAGE_QR",
    "VIEW_BILLING",
  ],
  Viewer: [...VIEW_CODES],
};

export async function hasPermission(code: PermissionCode | string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  if (session.platformRole === "SUPER_ADMIN") return true;
  return session.permissions?.includes(code) ?? false;
}

export async function requirePermission(code: PermissionCode | string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.platformRole === "SUPER_ADMIN") return session;
  if (session.permissions?.includes(code)) return session;
  throw new Error("You don't have permission to perform this action.");
}

export async function ensurePermissions(): Promise<void> {
  const count = await prisma.permission.count();
  if (count > 0) return;

  await prisma.permission.createMany({
    data: PERMISSIONS.map((code) => {
      const parts = code.split("_");
      const permissionModule = parts.length > 1 ? parts[1].toLowerCase() : "general";
      return {
        code,
        module: permissionModule,
        description: code
          .split("_")
          .join(" ")
          .toLowerCase()
          .replace(/^./, (c) => c.toUpperCase()),
      };
    }),
  });
}

export async function syncRolePermissions(roleId: string, roleName: string): Promise<void> {
  const assignment = ROLE_PERMISSION_SETS[roleName];
  if (!assignment) return;

  const perms = await prisma.permission.findMany({
    where: { code: { in: [...assignment] } },
  });
  const allowedIds = new Set(perms.map((p) => p.id));

  const existing = await prisma.rolePermission.findMany({ where: { roleId } });

  const toAdd = perms.filter((p) => !existing.some((e) => e.permissionId === p.id));
  const toRemove = existing.filter((e) => !allowedIds.has(e.permissionId));

  if (toAdd.length > 0) {
    await prisma.rolePermission.createMany({
      data: toAdd.map((p) => ({ roleId, permissionId: p.id })),
    });
  }
  if (toRemove.length > 0) {
    await prisma.rolePermission.deleteMany({
      where: { id: { in: toRemove.map((r) => r.id) } },
    });
  }
}
