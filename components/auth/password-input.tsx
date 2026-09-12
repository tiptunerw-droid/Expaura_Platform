"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative w-full">
      <input
        type={visible ? "text" : "password"}
        className={cn("w-full pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-text-primary transition-colors focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Eye className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}