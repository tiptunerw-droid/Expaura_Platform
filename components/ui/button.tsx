"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ember text-[#ffffff] hover:bg-ember-deep active:bg-ember-deep/90 shadow-sm",
        secondary:
          "bg-ceramic-deep text-ink hover:bg-line-strong",
        ghost:
          "bg-transparent text-ink hover:bg-ceramic-deep",
        outline:
          "bg-transparent text-ink border border-line hover:bg-ceramic-deep",
        destructive:
          "bg-rose text-[#ffffff] hover:bg-rose/90 shadow-sm",
        brass:
          "bg-brass-soft text-brass hover:bg-brass hover:text-[#ffffff]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
