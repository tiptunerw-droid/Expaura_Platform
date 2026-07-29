"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingSizes = {
  sm: { star: "w-4 h-4", gap: "gap-0.5" },
  lg: { star: "w-6 h-6", gap: "gap-1" },
};

const ratingColors = {
  default: "#b78a3a",
  herb: "#3f8b5c",
  rose: "#d9465b",
};

interface RatingInputProps {
  value: number;
  onValueChange: (value: number) => void;
  size?: "sm" | "lg";
  className?: string;
}

function RatingInput({
  value,
  onValueChange,
  size = "lg",
  className,
}: RatingInputProps) {
  const [hovered, setHovered] = React.useState<number>(0);
  const sizeConfig = ratingSizes[size];

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className={cn("inline-flex items-center", sizeConfig.gap, className)}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            onClick={() => onValueChange(star)}
            onMouseEnter={() => setHovered(star)}
          >
            <Star
              className={cn(
                sizeConfig.star,
                "transition-colors",
                isActive ? "fill-brass text-brass" : "text-line-strong"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingDisplayProps {
  value: number;
  size?: "sm" | "lg";
  variant?: "default" | "herb" | "rose";
  className?: string;
}

function RatingDisplay({
  value,
  size = "sm",
  variant = "default",
  className,
}: RatingDisplayProps) {
  const sizeConfig = ratingSizes[size];
  const color = ratingColors[variant];
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <div
      className={cn("inline-flex items-center", sizeConfig.gap, className)}
      aria-label={`Rating: ${clamped.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(
          0,
          Math.min(1, clamped - (star - 1))
        ) * 100;

        return (
          <div
            key={star}
            className="relative"
            style={{ width: "auto", height: "auto" }}
          >
            <Star
              className={cn(sizeConfig.star, "text-line-strong")}
            />
            {fillPercent > 0 && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{
                  width: `${fillPercent}%`,
                  height: "100%",
                  display: "inline-block",
                }}
              >
                <Star
                  className={cn(sizeConfig.star)}
                  style={{
                    fill: color,
                    color: color,
                    display: "inline-block",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { RatingInput, RatingDisplay };
