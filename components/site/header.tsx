"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function SiteHeader({ className }: { className?: string }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-line backdrop-blur-md bg-ceramic/80",
        scrolled && "border-line-strong",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-2xl tracking-tight text-ink">
              Expaura
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/#directory"
              className="px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors rounded"
            >
              Directory
            </Link>
            <Link
              href="/#restaurants"
              className="px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors rounded"
            >
              For restaurants
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
