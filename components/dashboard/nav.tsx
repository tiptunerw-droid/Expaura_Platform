"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/complaints", label: "Complaints", icon: AlertCircle },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/waiters", label: "Waiters", icon: User },
  { href: "/dashboard/employees", label: "Employees", icon: UsersRound },
  { href: "/dashboard/branches", label: "Branches", icon: Building2 },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

interface DashboardNavProps {
  userName?: string;
  userRole?: string;
  className?: string;
}

function DashboardNav({
  userName = "Manager",
  userRole = "Restaurant Owner",
  className,
}: DashboardNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col fixed left-0 top-0 w-64 h-screen bg-white border-r border-line z-30",
        className
      )}
    >
      <div className="h-16 flex items-center px-6 border-b border-line shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight text-ink">
            Expaura
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                isActive
                  ? "bg-ember-soft text-ember"
                  : "text-ink-soft hover:bg-ceramic-deep hover:text-ink"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-ceramic-deep">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-ember text-white text-sm font-semibold shrink-0">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{userName}</p>
            <p className="text-xs text-ink-muted truncate">{userRole}</p>
          </div>
          <form action={handleLogout}>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="h-8 w-8 text-ink-muted hover:text-ink"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export { DashboardNav };
