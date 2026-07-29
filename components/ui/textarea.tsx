"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "flex min-h-[96px] w-full border border-line bg-white rounded py-2.5 px-3.5 text-sm text-ink placeholder:text-ink-muted transition-colors resize-y",
          "focus:border-brass focus:outline-none focus:shadow-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
