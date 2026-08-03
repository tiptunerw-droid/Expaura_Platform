"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  restaurantName: string;
  restaurantLogo: string | null;
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

function DashboardShell({
  children,
  userName,
  userRole,
  restaurantName,
  restaurantLogo,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const currentTitle = titleMap[pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-surface text-text-primary selection:bg-emerald-500 selection:text-white">
      <DashboardNav
        userName={userName}
        userRole={userRole}
        restaurantName={restaurantName}
        restaurantLogo={restaurantLogo}
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
          userName={userName}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export { DashboardShell };
