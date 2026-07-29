"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCurrentUser } from "@/lib/actions/auth";

interface AuthState {
  authenticated: boolean;
  userName: string;
  userRole: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = React.useState<AuthState>({
    authenticated: false,
    userName: "",
    userRole: "",
  });
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result.authenticated && result.user) {
          setAuthState({
            authenticated: true,
            userName: result.user.name,
            userRole:
              result.user.platformRole === "SUPER_ADMIN"
                ? "Super Admin"
                : "Restaurant Manager",
          });
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ceramic flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-ember animate-spin" />
      </div>
    );
  }

  if (!authState.authenticated) {
    return null;
  }

  const titleMap: Record<string, string> = {
    "/dashboard": "Analytics",
    "/dashboard/reviews": "Reviews",
    "/dashboard/complaints": "Complaints",
    "/dashboard/menu": "Menu",
    "/dashboard/gallery": "Gallery",
    "/dashboard/staff": "Staff",
    "/dashboard/waiters": "Waiters",
    "/dashboard/employees": "Employees",
    "/dashboard/branches": "Branches",
    "/dashboard/profile": "Profile",
  };

  const currentTitle = titleMap[pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-ceramic">
      <DashboardNav
        userName={authState.userName}
        userRole={authState.userRole}
      />
      <div className="lg:pl-64">
        <DashboardHeader
          title={currentTitle}
          userName={authState.userName}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
