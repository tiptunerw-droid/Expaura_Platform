"use client";

import * as React from "react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrRevealProps {
  children: React.ReactNode;
  restaurantName: string;
  className?: string;
}

function QrReveal({ children, restaurantName, className }: QrRevealProps) {
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = prefersReduced ? 0 : 900;
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("relative min-h-[60vh]", className)}>
      {!revealed && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ceramic"
          aria-hidden={revealed}
        >
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-ink rounded-lg" />
            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-ink rounded-sm" />
            <div className="absolute top-3 right-3 w-8 h-8 border-2 border-ink rounded-sm" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-2 border-ink rounded-sm" />
            <QrCode className="w-16 h-16 text-ink opacity-80" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-ember aura-pulse origin-center" />
          </div>
          <p className="mt-6 font-display text-lg text-ink">Opening {restaurantName}…</p>
          <p className="text-sm text-ink-muted mt-1">Menu · Hours · Reviews</p>
        </div>
      )}
      <div
        className={cn(
          "transition-all duration-700 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { QrReveal };
