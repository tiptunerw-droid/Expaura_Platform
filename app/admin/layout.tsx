"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Map,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCurrentUser, logout } from "@/lib/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/restaurants", label: "Restaurants", icon: Building2 },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { href: "/admin/cities", label: "Cities & Categories", icon: Map },
  { href: "/admin/profile", label: "Profile", icon: Settings },
];

function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 w-64 h-screen bg-white border-r border-line z-30">
      <div className="px-6 pt-5 pb-2 border-b border-line shrink-0">
        <Badge variant="brass" size="sm" className="mb-3">
          Platform Admin
        </Badge>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight text-ink">
            Expaura
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
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
            <p className="text-xs text-ink-muted truncate">Super Admin</p>
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

interface AdminHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  userName: string;
}

function AdminHeader({
  title,
  breadcrumbs = [{ label: "Admin" }],
  userName,
}: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-line flex items-center pl-64">
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
                <Link
                  href="/admin/profile"
                  className="block w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-ceramic-deep"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile Settings
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface AuthState {
  isSuperAdmin: boolean;
  userName: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = React.useState<AuthState>({
    isSuperAdmin: false,
    userName: "",
  });
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (
          result.authenticated &&
          result.user &&
          result.user.platformRole === "SUPER_ADMIN"
        ) {
          setAuthState({
            isSuperAdmin: true,
            userName: result.user.name,
          });
        } else {
          setAuthState({ isSuperAdmin: false, userName: "" });
          if (pathname !== "/admin/login" && pathname !== "/admin/register") {
            router.push("/admin/login");
          }
        }
      } catch {
        setAuthState({ isSuperAdmin: false, userName: "" });
        if (pathname !== "/admin/login" && pathname !== "/admin/register") {
          router.push("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  if (loading || !authState.isSuperAdmin) {
    if (isAuthPage) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-ceramic flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-ember animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic">
      <AdminSidebar userName={authState.userName} />
      <div className="lg:pl-64">
        <AdminHeader title="Platform Admin" userName={authState.userName} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
