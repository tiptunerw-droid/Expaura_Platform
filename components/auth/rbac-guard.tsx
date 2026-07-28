"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth";

interface SessionUser {
  userId: string;
  email: string;
  name: string;
  platformRole: "SUPER_ADMIN" | "ADMIN" | "USER";
  activeRestaurantId?: string;
  roleName?: string;
  permissions?: string[];
}

interface RbacGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPlatformRole?: "SUPER_ADMIN" | "ADMIN";
  fallback?: React.ReactNode;
}

export function RbacGuard({
  children,
  requiredPermission,
  requiredPlatformRole,
  fallback = null,
}: RbacGuardProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user as SessionUser);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!user) return <>{fallback}</>;

  if (requiredPlatformRole && user.platformRole !== requiredPlatformRole && user.platformRole !== "SUPER_ADMIN") {
    return <>{fallback}</>;
  }

  if (requiredPermission) {
    const hasPerm =
      user.platformRole === "SUPER_ADMIN" ||
      (user.permissions && user.permissions.includes(requiredPermission));
    if (!hasPerm) return <>{fallback}</>;
  }

  return <>{children}</>;
}
