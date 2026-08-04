"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BarChart3,
  MessageSquare,
  AlertCircle,
  UtensilsCrossed,
  Images,
  Users,
  User,
  UsersRound,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

export interface PlanFeatures {
  analyticsEnabled: boolean;
  aiSummaryEnabled: boolean;
  complaintsEnabled: boolean;
  employeeTrackingEnabled: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: keyof PlanFeatures;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Analytics", icon: BarChart3, feature: "analyticsEnabled" },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/complaints", label: "Complaints", icon: AlertCircle, feature: "complaintsEnabled" },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/waiters", label: "Waiters", icon: User, feature: "employeeTrackingEnabled" },
  { href: "/dashboard/employees", label: "Employees", icon: UsersRound, feature: "employeeTrackingEnabled" },
  { href: "/dashboard/branches", label: "Branches", icon: Building2 },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

interface DashboardNavProps {
  userName?: string;
  userRole?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  restaurantName?: string;
  restaurantLogo?: string | null;
  planFeatures?: PlanFeatures;
}

function DashboardNav({
  userName = "Manager",
  userRole = "Restaurant Owner",
  className,
  isOpen = false,
  onClose,
  restaurantName,
  restaurantLogo,
  planFeatures,
}: DashboardNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.feature) return true;
    return planFeatures?.[item.feature] ?? false;
  });

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 w-64 h-screen flex flex-col bg-surface border-r border-border-subtle z-30 text-text-primary selection:bg-emerald-500 selection:text-white transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      <div className="h-20 flex items-center gap-3 px-8 border-b border-border-subtle shrink-0">
        {restaurantLogo ? (
          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-800 shrink-0">
            <Image src={restaurantLogo} alt="" fill className="object-cover" />
          </div>
        ) : null}
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <span className="text-xl font-bold tracking-tighter uppercase truncate">
            {restaurantName || "Expaura"}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-gray-500 hover:text-text-primary hover:bg-surface-alt"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border-subtle p-4">
        <div className="flex items-center gap-4 p-3 bg-surface-alt">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-[#ffffff] text-xs font-black shrink-0">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink truncate">{userName}</p>
            <p className="text-[9px] uppercase tracking-wider text-emerald-500 truncate">{userRole}</p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="h-8 w-8 text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export { DashboardNav };
