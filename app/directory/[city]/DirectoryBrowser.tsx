"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isRestaurantOpen, cn } from "@/lib/utils";

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  openingHours: unknown;
  createdAt: Date | string;
  city?: { id: string; name: string } | null;
  reviewCount: number;
  averageOverall: number;
}

interface DirectoryBrowserProps {
  city: string;
  restaurants: Restaurant[];
}

function DirectoryBrowser({ city, restaurants }: DirectoryBrowserProps) {
  const searchParams = useSearchParams();
  const minRating = searchParams.get("minRating");
  const open = searchParams.get("open");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"rating" | "newest">("rating");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = restaurants;
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.address ?? "").toLowerCase().includes(q)
      );
    }
    if (minRating) list = list.filter((r) => r.averageOverall >= Number(minRating));
    if (open === "true") list = list.filter((r) => isRestaurantOpen(r.openingHours).open);
    return [...list].sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (b.averageOverall !== a.averageOverall) return b.averageOverall - a.averageOverall;
      return b.reviewCount - a.reviewCount;
    });
  }, [restaurants, minRating, open, query, sort]);

  const hasActiveFilters = Boolean(minRating || open);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or address…"
          className="pl-9 h-9 bg-surface-alt border-gray-700 text-text-primary placeholder:text-gray-500 text-sm"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border-subtle">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active filters:</span>
          {minRating && (
            <Link href={`/directory/${city}`}>
              <Badge variant="default" size="sm" className="bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700">
                {minRating}+ stars
              </Badge>
            </Link>
          )}
          {open === "true" && (
            <Link href={`/directory/${city}`}>
              <Badge variant="default" size="sm" className="bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700">
                Open now
              </Badge>
            </Link>
          )}
          <Link href={`/directory/${city}`} className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-bold ml-1">
            Clear all
          </Link>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Filters</h3>
              {hasActiveFilters && (
                <Link href={`/directory/${city}`} className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-widest">
                  Reset
                </Link>
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Minimum Rating</h4>
              <div className="space-y-1.5">
                {[4, 3, 2].map((star) => {
                  const active = minRating === String(star);
                  return (
                    <Link
                      key={star}
                      href={active ? `/directory/${city}` : `/directory/${city}?minRating=${star}`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                        active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-surface-alt border border-transparent"
                      )}
                    >
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-3.5 h-3.5",
                              s <= star ? "fill-brass text-brass" : "text-gray-700"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">& up</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Availability</h4>
              <Link
                href={open === "true" ? `/directory/${city}` : `/directory/${city}?open=true`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  open === "true" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-surface-alt border border-transparent"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Open now
              </Link>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Sort by</h4>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "rating" | "newest")}
                className="w-full h-9 px-3 text-xs bg-surface-alt border border-gray-700 rounded text-gray-300"
              >
                <option value="rating">Rating: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4">
          <Link
            href={open === "true" ? `/directory/${city}` : `/directory/${city}?open=true`}
            className={cn(
              "shrink-0 h-8 px-3 rounded text-xs font-medium border transition-colors flex items-center gap-1.5",
              open === "true" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-surface-alt text-gray-400 border-gray-700 hover:border-gray-500"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open now
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Star className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="font-display text-xl text-gray-400">No results</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try a different name, or clear filters.
              </p>
              <Link href={`/directory/${city}`}>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  Clear filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 pb-2">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>

              {filtered.map((r) => {
                const { open: isOpen, label } = isRestaurantOpen(r.openingHours);
                const hasRating = r.reviewCount > 0;

                return (
                  <Link
                    key={r.id}
                    href={`/r/${r.slug}`}
                    className="group block bg-surface-alt border border-border-subtle rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-44 h-44 sm:h-auto shrink-0 bg-gray-800">
                        {r.coverImageUrl ? (
                          <Image
                            src={r.coverImageUrl}
                            alt={r.name}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 176px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="w-8 h-8 text-gray-700" />
                          </div>
                        )}
                        {r.logoUrl && (
                          <div className="absolute bottom-2 right-2 w-9 h-9 rounded-lg overflow-hidden bg-surface-alt border border-gray-700 shadow-lg">
                            <Image src={r.logoUrl} alt="" fill className="object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-display text-base sm:text-lg text-text-primary group-hover:text-emerald-400 transition-colors truncate">
                                {r.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {r.city?.name || "Kigali"}
                                {r.address && <span className="text-gray-600"> · {r.address}</span>}
                              </p>
                            </div>
                            {hasRating && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        s <= Math.round(r.averageOverall) ? "fill-brass text-brass" : "text-gray-700"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-medium text-text-primary">{r.averageOverall.toFixed(1)}</span>
                                <span className="text-[10px] text-gray-500">({r.reviewCount})</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className={cn(
                              "text-xs font-medium",
                              isOpen ? "text-emerald-400" : "text-gray-500"
                            )}>
                              {isOpen ? "Open now" : "Closed"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                          <span className="text-[10px] text-gray-600">
                            {isOpen && label ? label : ""}
                          </span>
                          <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                            View details
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DirectoryBrowser };
