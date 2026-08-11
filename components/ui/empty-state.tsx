"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "neutral" | "review" | "complaint" | "menu";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
  titleClassName?: string;
}

const variantBg: Record<EmptyStateVariant, string> = {
  neutral: "bg-ceramic-deep",
  review: "bg-herb-soft",
  complaint: "bg-ember-soft",
  menu: "bg-brass-soft",
};

const variantIcon: Record<EmptyStateVariant, string> = {
  neutral: "text-ink-muted",
  review: "text-herb",
  complaint: "text-ember",
  menu: "text-brass",
};

function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "neutral",
  className,
  titleClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 rounded-full mb-5",
          variantBg[variant]
        )}
      >
        <div className={cn("w-8 h-8", variantIcon[variant])}>
          {icon}
        </div>
      </div>
      <h3 className={cn("font-display text-xl text-ink mb-2", titleClassName)}>{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-6">{description}</p>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export { EmptyState };
