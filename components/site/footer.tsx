"use client";

import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { cn } from "@/lib/utils";

function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("dark-section border-t border-[#fafaf8]/10 py-8 sm:py-10", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl text-[#fafaf8]">
          Expaura
        </Link>
        <p className="text-xs text-[#9e9e9e] text-center max-w-sm">
          Connecting restaurants with their guests across Rwanda. Digital menus, honest feedback, and smarter hospitality.
        </p>
        <div className="flex items-center gap-2">
          <SocialIcon url="https://instagram.com/expaura_rw" target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28 }} />
          <SocialIcon url="https://twitter.com/expaura_rw" target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28 }} />
          <SocialIcon url="https://linkedin.com/company/expaura" target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28 }} />
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
