import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { seedDefaultRolesForRestaurant, getUserPermissions } from "@/lib/auth/rbac";

const registerOwnerSchema = z.object({
  name: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  cityName: z.string().min(1, "Please select a city"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerOwnerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, restaurantName, cityName, phone, address } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Resolve city — create if it doesn't exist
    let city = await prisma.city.findFirst({
      where: { name: { equals: cityName, mode: "insensitive" } },
    });
    if (!city) {
      city = await prisma.city.create({
        data: { name: cityName, region: null, country: "Rwanda" },
      });
    }

    const passwordHash = await hashPassword(password);
    const slug = generateSlug(restaurantName);

    // Transaction to create User, Restaurant, Roles, and Staff membership
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          platformRole: "USER",
          isActive: true,
        },
      });

      // 2. Create Restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug,
          cityId: city.id,
          phone,
          address,
          email: email.toLowerCase(),
          isActive: true,
        },
      });

      return { user, restaurant };
    });

    // 3. Seed Default Roles (Owner, Manager, Viewer)
    const { ownerRole } = await seedDefaultRolesForRestaurant(result.restaurant.id);

    // 4. Create Staff link with Owner role
    await prisma.restaurantStaff.create({
      data: {
        userId: result.user.id,
        restaurantId: result.restaurant.id,
        roleId: ownerRole.id,
        isActive: true,
      },
    });

    // 5. Fetch permissions for session token
    const { permissions } = await getUserPermissions(result.user.id, result.restaurant.id);

    // 6. Set Session Cookie
    await setSessionCookie({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      platformRole: "USER",
      activeRestaurantId: result.restaurant.id,
      roleId: ownerRole.id,
      roleName: ownerRole.name,
      permissions,
    });

    // 7. Audit log
    await prisma.auditLog.create({
      data: {
        userId: result.user.id,
        restaurantId: result.restaurant.id,
        action: "RESTAURANT_OWNER_REGISTERED",
        entity: "Restaurant",
        entityId: result.restaurant.id,
      },
    });

    return NextResponse.json(
      {
        message: "Restaurant owner registered successfully.",
        user: { id: result.user.id, name: result.user.name, email: result.user.email },
        restaurant: { id: result.restaurant.id, name: result.restaurant.name, slug: result.restaurant.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Restaurant Owner Register Error]", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
