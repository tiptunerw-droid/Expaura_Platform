"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("skeleton inline-block", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
