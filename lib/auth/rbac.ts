import { prisma } from "@/lib/prisma";
import { ensurePermissions, syncRolePermissions, ROLE_PERMISSION_SETS } from "@/lib/auth/permissions";

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

  if (staffRecord.role.rolePermissions.length === 0) {
    await ensurePermissions();
    await syncRolePermissions(staffRecord.role.id, staffRecord.role.name);
    const refreshed = await prisma.restaurantStaff.findUnique({
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
    if (refreshed) {
      return {
        roleId: refreshed.role.id,
        roleName: refreshed.role.name,
        permissions: refreshed.role.rolePermissions.map((rp) => rp.permission.code),
      };
    }
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
    await ensurePermissions();
    for (const role of existingRoles) {
      if (role.name === "Owner" || role.name === "Manager" || role.name === "Viewer") {
        await syncRolePermissions(role.id, role.name);
      }
    }
    const ownerRole = existingRoles.find((r) => r.name === "Owner") ?? existingRoles[0];
    const managerRole = existingRoles.find((r) => r.name === "Manager") ?? existingRoles[1] ?? ownerRole;
    const viewerRole = existingRoles.find((r) => r.name === "Viewer") ?? existingRoles[2] ?? managerRole;
    return { ownerRole, managerRole, viewerRole };
  }

  await ensurePermissions();

  const assignPermissions = async (roleId: string, roleName: string) => {
    const codes = ROLE_PERMISSION_SETS[roleName];
    const permissions = await prisma.permission.findMany({
      where: codes ? { code: { in: [...codes] } } : undefined,
    });
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId,
          permissionId: p.id,
        })),
      });
    }
  };

  // 1. Owner Role (All permissions)
  const ownerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Owner",
      description: "Full access to restaurant settings, staff, billing, and analytics",
      isDefault: true,
    },
  });
  await assignPermissions(ownerRole.id, "Owner");

  // 2. Manager Role (Manage menu, reviews, complaints, gallery, employees)
  const managerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Manager",
      description: "Manage menus, reviews, complaints, gallery, and view analytics",
      isDefault: true,
    },
  });
  await assignPermissions(managerRole.id, "Manager");

  // 3. Viewer Role (Read-only)
  const viewerRole = await prisma.role.create({
    data: {
      restaurantId,
      name: "Viewer",
      description: "Read-only access to view reviews and analytics",
      isDefault: true,
    },
  });
  await assignPermissions(viewerRole.id, "Viewer");

  return { ownerRole, managerRole, viewerRole };
}
