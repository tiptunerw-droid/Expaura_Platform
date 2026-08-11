import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/ui/rating";
import { cn, isRestaurantOpen } from "@/lib/utils";

interface RestaurantCardProps {
  slug: string;
  name: string;
  cityName?: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  averageOverall: number;
  reviewCount: number;
  openingHours?: unknown;
  className?: string;
  compact?: boolean;
}

function RestaurantCard({
  slug,
  name,
  cityName,
  coverImageUrl,
  averageOverall,
  reviewCount,
  openingHours,
  className,
  compact = false,
}: RestaurantCardProps) {
  const { open } = isRestaurantOpen(openingHours);
  const hasRating = reviewCount > 0;

  return (
    <Link
      href={`/r/${slug}`}
      className={cn(
        "group block bg-surface border border-line rounded-lg overflow-hidden transition-all",
        "hover:border-line-strong",
        className
      )}
    >
      <div className={cn("relative bg-ceramic-deep", compact ? "h-36" : "h-44")}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ceramic-deep to-line" />
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={open ? "dark" : "outline"} size="sm">
            {open ? "Open now" : "Closed"}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg text-ink truncate group-hover:text-ink/70 transition-colors">
              {name}
            </h3>
            {cityName && (
              <p className="flex items-center gap-1 text-xs text-ink-muted mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" style={{ color: "#d9465b" }} />
                <span className="truncate">{cityName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
          {hasRating ? (
            <div className="flex items-center gap-2">
              <RatingDisplay value={averageOverall} size="sm" />
              <span className="font-tabular text-xs text-ink-muted">
                {reviewCount}
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">New</span>
          )}
          <span className="text-[10px] text-ink-muted group-hover:text-ink transition-colors">
            View Menu →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { RestaurantCard };
