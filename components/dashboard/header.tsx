"use client";

import * as React from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  userName?: string;
  className?: string;
  onMenuToggle?: () => void;
}

function DashboardHeader({
  title,
  breadcrumbs = [{ label: "Dashboard" }],
  userName = "Manager",
  className,
  onMenuToggle,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-20 bg-surface border-b border-border-subtle flex items-center justify-between text-text-primary",
        className
      )}
    >
      <div className="flex-1 min-w-0 flex items-center gap-4 px-4 sm:px-8">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-[#ffffff] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && <span className="text-gray-700">/</span>}
                <span className="truncate">{crumb.label}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 px-8">
        <div className="hidden md:block relative w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="SEARCH..."
            className="w-full pl-10 pr-4 py-2 bg-transparent border-b-2 border-border-subtle focus:outline-none focus:border-emerald-500 text-text-primary placeholder-text-tertiary text-xs font-bold uppercase tracking-widest transition-colors"
          />
        </div>

        <NotificationDropdown />

        <ThemeToggle />

        <div className="relative">
          <button
            className="flex items-center gap-2 pl-2 pr-1 h-10 border border-border-subtle hover:border-emerald-500 transition-colors bg-surface-alt"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-[#ffffff] text-xs font-black">
              {initials || "U"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle z-20">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-surface-alt hover:text-text-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-surface-alt hover:text-text-primary transition-colors border-t border-border-subtle"
                  onClick={() => setMenuOpen(false)}
                >
                  Switch Branch
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export { DashboardHeader };
