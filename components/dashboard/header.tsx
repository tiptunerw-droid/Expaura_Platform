"use client";

import * as React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  userName?: string;
  className?: string;
}

function DashboardHeader({
  title,
  breadcrumbs = [{ label: "Dashboard" }],
  userName = "Manager",
  className,
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
        "sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-line flex items-center",
        className
      )}
    >
      <div className="flex-1 min-w-0 flex items-center gap-4 px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-0.5">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && <span>/</span>}
                <span className="truncate">{crumb.label}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="font-display text-lg text-ink truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6">
        <div className="hidden md:block relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 h-9 bg-ceramic-deep/50 border-transparent focus:border-brass"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-ink-soft" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ember" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 pl-1 pr-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brass text-white text-xs font-semibold">
              {initials || "U"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </Button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-line py-1 z-20">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-ceramic-deep"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-ceramic-deep"
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
