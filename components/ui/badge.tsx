"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-ceramic-deep text-ink-muted",
        dark: "bg-[#141414] text-[#fafaf8]",
        herb: "bg-herb-soft text-herb",
        ember: "bg-ember-soft text-ember",
        brass: "bg-brass-soft text-brass",
        rose: "bg-rose-soft text-rose",
        outline: "bg-transparent border border-line text-ink-soft",
      },
      size: {
        sm: "h-5 px-2 text-[10px]",
        default: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
