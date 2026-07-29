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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-emerald-500 animate-spin" />
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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3] selection:bg-emerald-500 selection:text-white">
      <DashboardNav
        userName={authState.userName}
        userRole={authState.userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <DashboardHeader
          title={currentTitle}
          userName={authState.userName}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
