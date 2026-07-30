"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full border border-line bg-white dark:bg-surface-alt rounded py-2.5 px-3.5 text-sm text-ink placeholder:text-ink-muted transition-colors",
          "focus:border-brass focus:outline-none focus:shadow-none",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink file:mr-3 file:cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
