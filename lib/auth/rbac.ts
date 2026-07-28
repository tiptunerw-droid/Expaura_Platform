import { prisma } from "@/lib/prisma";

export async function getUserPermissions(userId: string, restaurantId: string): Promise<{ roleName: string; roleId: string; permissions: string[] }> {
  const staffRecord = await prisma.restaurantStaff.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId,
      },
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!staffRecord || !staffRecord.isActive) {
    return { roleName: "", roleId: "", permissions: [] };
  }

  const permissions = staffRecord.role.rolePermissions.map((rp) => rp.permission.code);
  return {
    roleId: staffRecord.role.id,
    roleName: staffRecord.role.name,
    permissions,
  };
}

interface RoleRecord {
  id: string;
  name: string;
  createdAt: Date;
  description: string | null;
  restaurantId: string;
  isDefault: boolean;
}

export async function seedDefaultRolesForRestaurant(
  restaurantId: string
): Promise<{
  ownerRole: RoleRecord;
  managerRole: RoleRecord;
  viewerRole: RoleRecord;
}> {
  const existingRoles = await prisma.role.findMany({
    where: { restaurantId },
  });

  if (existingRoles.length > 0) {
    const ownerRole = existingRoles.find((r) => r.name === "Owner") ?? existingRoles[0];
    const managerRole = existingRoles.find((r) => r.name === "Manager") ?? existingRoles[1] ?? ownerRole;
    const viewerRole = existingRoles.find((r) => r.name === "Viewer") ?? existingRoles[2] ?? managerRole;
    return { ownerRole, managerRole, viewerRole };
  }

  // Get all system permissions
  const permissions = await prisma.permission.findMany();

  // 1. Owner Role (All permissions)
  const ownerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Owner",
      description: "Full access to restaurant settings, staff, billing, and analytics",
      isDefault: true,
    },
  });

  if (permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: ownerRole.id,
        permissionId: p.id,
      })),
    });
  }

  // 2. Manager Role (Menu, Reviews, Complaints, Gallery)
  const managerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Manager",
      description: "Manage menus, reviews, complaints, and view analytics",
      isDefault: true,
    },
  });

  const managerPermissions = permissions.filter((p) =>
    !p.code.includes("SETTING") && !p.code.includes("BILLING") && !p.code.includes("ROLE")
  );

  if (managerPermissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: managerPermissions.map((p) => ({
        roleId: managerRole.id,
        permissionId: p.id,
      })),
    });
  }

  // 3. Viewer Role (Read-only)
  const viewerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Viewer",
      description: "Read-only access to view reviews and analytics",
      isDefault: true,
    },
  });

  const viewerPermissions = permissions.filter((p) => p.code.startsWith("VIEW_"));

  if (viewerPermissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: viewerPermissions.map((p) => ({
        roleId: viewerRole.id,
        permissionId: p.id,
      })),
    });
  }

  return { ownerRole, managerRole, viewerRole };
}
