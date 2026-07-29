"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SatisfactionAuraProps {
  rating: number | null;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const colorBands = [
  { threshold: 4.4, color: "#3f8b5c", soft: "rgba(63, 139, 92, 0.22)", label: "Very Good" },
  { threshold: 3.6, color: "#b78a3a", soft: "rgba(183, 138, 58, 0.22)", label: "Good" },
  { threshold: 2.6, color: "#e3562a", soft: "rgba(227, 86, 42, 0.22)", label: "Fair" },
  { threshold: 0, color: "#d9465b", soft: "rgba(217, 70, 91, 0.22)", label: "Poor" },
];

function getColorInfo(rating: number | null) {
  if (rating === null || rating === 0) {
    return { color: "#c9c5ba", soft: "rgba(201, 197, 186, 0.18)", label: null };
  }
  for (const band of colorBands) {
    if (rating >= band.threshold) {
      return { color: band.color, soft: band.soft, label: band.label };
    }
  }
  return colorBands[colorBands.length - 1];
}

function SatisfactionAura({
  rating,
  size = 140,
  showLabel = true,
  className,
}: SatisfactionAuraProps) {
  const { color, soft, label } = getColorInfo(rating);
  const validRating = rating ?? 0;
  const hasRating = rating !== null && rating > 0;

  const strokeWidth = 6;
  const outerStrokeWidth = 3;
  const padding = 10;
  const innerRadius = (size - padding * 2 - strokeWidth * 2 - outerStrokeWidth * 2) / 2;
  const outerRadius = innerRadius + strokeWidth / 2 + outerStrokeWidth / 2 + 4;
  const center = size / 2;

  const circumference = 2 * Math.PI * innerRadius;
  const progress = hasRating ? Math.max(0, Math.min(1, validRating / 5)) : 0;
  const dashOffset = circumference * (1 - progress);

  const displayNumber = hasRating ? validRating.toFixed(1) : "—";

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-label={
          hasRating
            ? `Satisfaction rating ${validRating.toFixed(1)} out of 5, ${label}`
            : "No reviews yet"
        }
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke={soft}
            strokeWidth={outerStrokeWidth}
            className="aura-pulse"
            style={{ transformOrigin: "center" }}
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke={hasRating ? soft : "#e5e3dc"}
            strokeWidth={strokeWidth}
          />
          {hasRating && (
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
            />
          )}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - strokeWidth - 2}
            fill="white"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-display leading-none"
            style={{
              color: hasRating ? color : "#6b726b",
              fontSize: size * 0.28,
            }}
          >
            {displayNumber}
          </span>
          {showLabel && hasRating && (
            <span
              className="font-sans mt-0.5 font-medium"
              style={{
                color: color,
                fontSize: Math.max(10, size * 0.09),
              }}
            >
              {label}
            </span>
          )}
          {showLabel && !hasRating && (
            <span
              className="font-sans mt-0.5 font-medium"
              style={{
                color: "#6b726b",
                fontSize: Math.max(10, size * 0.08),
              }}
            >
              No reviews yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { SatisfactionAura };
