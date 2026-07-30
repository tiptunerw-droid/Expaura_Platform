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
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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

function AdminSidebar({ userName, isOpen, onClose }: { userName: string; isOpen?: boolean; onClose?: () => void }) {
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
    <aside
      className={cn(
        "fixed left-0 top-0 w-64 h-screen bg-surface border-r border-border-subtle z-30 text-primary selection:bg-purple-600 selection:text-white transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="h-20 flex flex-col justify-center px-8 border-b border-border-subtle shrink-0">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-500 bg-purple-500/10 px-2 py-0.5 w-max mb-1">
          Platform Admin
        </span>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter uppercase">
            Expaura
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
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
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-gray-500 hover:text-white hover:bg-surface-alt"
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
          <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white text-xs font-black shrink-0">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white truncate">{userName}</p>
            <p className="text-[9px] uppercase tracking-wider text-purple-500 truncate">Super Admin</p>
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

interface AdminHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  userName: string;
  onMenuToggle?: () => void;
}

function AdminHeader({
  title,
  breadcrumbs = [{ label: "Admin" }],
  userName,
  onMenuToggle,
}: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-20 bg-surface border-b border-border-subtle flex items-center justify-between text-text-primary">
      <div className="flex-1 min-w-0 flex items-center gap-4 px-4 sm:px-8">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-1">
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

      <div className="flex items-center gap-4 px-8">
        <div className="hidden md:block relative w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="search"
            placeholder="SEARCH..."
            className="w-full pl-10 pr-4 py-2 bg-transparent border-b-2 border-border-subtle focus:outline-none focus:border-purple-500 text-white placeholder-gray-700 text-xs font-bold uppercase tracking-widest transition-colors"
          />
        </div>

        <ThemeToggle />

        <button
          className="relative p-2 text-gray-500 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 pl-2 pr-1 h-10 border border-border-subtle hover:border-purple-500 transition-colors bg-surface-alt"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-black">
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
                <Link
                  href="/admin/profile"
                  className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-surface-alt hover:text-white transition-colors"
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-border-subtle border-t-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-primary selection:bg-purple-600 selection:text-white">
      <AdminSidebar 
        userName={authState.userName} 
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
        <AdminHeader 
          title="Platform Admin" 
          userName={authState.userName} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
