import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, ArrowRight, UtensilsCrossed, SlidersHorizontal, X } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listDirectory } from "@/lib/actions/restaurants";
import { isRestaurantOpen, cn } from "@/lib/utils";

interface DirectoryPageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ minRating?: string; cuisine?: string; price?: string; open?: string }>;
}

const CITIES = ["Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri", "Muhanga"];

const CUISINES = ["African", "International", "Italian", "French", "Asian", "Indian", "Bar", "European", "Fusion", "Japanese", "Chinese", "Steakhouse", "Mediterranean", "Ethiopian", "Healthy", "American", "Seafood"];

const PRICE_LEVELS = [
  { id: "$", label: "Cheap Eats", desc: "Under RWF 5,000" },
  { id: "$$", label: "Mid-range", desc: "RWF 5,000 - 15,000" },
  { id: "$$$", label: "Fine Dining", desc: "RWF 15,000 - 30,000" },
  { id: "$$$$", label: "Luxury", desc: "Over RWF 30,000" },
];

function priceLevel(reviewCount: number): string {
  if (reviewCount >= 100) return "$$$$";
  if (reviewCount >= 50) return "$$$";
  if (reviewCount >= 10) return "$$";
  return "$";
}

export default async function DirectoryPage({ params, searchParams }: DirectoryPageProps) {
  const { city } = await params;
  const sp = await searchParams;
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);

  const allRestaurants = await listDirectory({
    cityName: cityTitle,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
  });

  let filtered = allRestaurants;
  if (sp.price) {
    const priceTarget = sp.price;
    filtered = filtered.filter((r) => priceLevel(r.reviewCount) === priceTarget);
  }
  if (sp.open === "true") {
    filtered = filtered.filter((r) => isRestaurantOpen(r.openingHours).open);
  }

  const hasActiveFilters = sp.minRating || sp.price || sp.open;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3]">
      <SiteHeader />
      <main className="pt-24 flex-1">
        {/* Hero */}
        <section className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Restaurants</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-[#F3F3F3] leading-tight">
                  {cityTitle}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-bold text-[#F3F3F3]">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "restaurant" : "restaurants"}
                </p>
              </div>
              <div className="relative w-full max-w-xs hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input placeholder="Search restaurants…" className="pl-9 h-9 bg-gray-900 border-gray-700 text-[#F3F3F3] placeholder:text-gray-500 text-sm" />
              </div>
            </div>

            {/* City pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {CITIES.map((c) => {
                const active = c.toLowerCase() === city.toLowerCase();
                return (
                  <Link key={c} href={`/directory/${c.toLowerCase()}`}>
                    <Badge
                      variant={active ? "dark" : "outline"}
                      className={cn(
                        "h-7 px-3 text-xs transition-colors cursor-pointer",
                        !active && "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-[#F3F3F3]"
                      )}
                    >
                      {c}
                    </Badge>
                  </Link>
                );
              })}
            </div>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active filters:</span>
                {sp.minRating && (
                  <Link href={`/directory/${city}`}>
                    <Badge variant="default" size="sm" className="bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700">
                      {sp.minRating}+ stars <X className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </Link>
                )}
                {sp.price && (
                  <Link href={`/directory/${city}`}>
                    <Badge variant="default" size="sm" className="bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700">
                      {sp.price} <X className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </Link>
                )}
                {sp.open === "true" && (
                  <Link href={`/directory/${city}`}>
                    <Badge variant="default" size="sm" className="bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700">
                      Open now <X className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </Link>
                )}
                <Link href={`/directory/${city}`} className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-bold ml-1">
                  Clear all
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Content: Sidebar + Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
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

                {/* Price */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Price</h4>
                  <div className="space-y-1.5">
                    {PRICE_LEVELS.map((p) => {
                      const active = sp.price === p.id;
                      return (
                        <Link
                          key={p.id}
                          href={active ? `/directory/${city}` : `/directory/${city}?price=${p.id}`}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded text-sm transition-colors",
                            active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-gray-900 border border-transparent"
                          )}
                        >
                          <div>
                            <span className="font-medium">{p.label}</span>
                            <p className="text-[10px] text-gray-600">{p.desc}</p>
                          </div>
                          <span className={cn("text-xs", active ? "text-emerald-400" : "text-gray-600")}>{p.id}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Minimum Rating</h4>
                  <div className="space-y-1.5">
                    {[4, 3, 2].map((star) => {
                      const active = sp.minRating === String(star);
                      return (
                        <Link
                          key={star}
                          href={active ? `/directory/${city}` : `/directory/${city}?minRating=${star}`}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                            active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-gray-900 border border-transparent"
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

                {/* Open Now */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Availability</h4>
                  <Link
                    href={sp.open === "true" ? `/directory/${city}` : `/directory/${city}?open=true`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                      sp.open === "true" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-gray-900 border border-transparent"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Open now
                  </Link>
                </div>

                {/* Sort */}
                <div className="pt-4 border-t border-gray-800">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Sort by</h4>
                  <select className="w-full h-9 px-3 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300">
                    <option>Popularity</option>
                    <option>Rating: High to Low</option>
                    <option>Rating: Low to High</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Mobile filter bar */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4">
              {PRICE_LEVELS.map((p) => (
                <Link
                  key={p.id}
                  href={sp.price === p.id ? `/directory/${city}` : `/directory/${city}?price=${p.id}`}
                  className={cn(
                    "shrink-0 h-8 px-3 rounded text-xs font-medium border transition-colors",
                    sp.price === p.id ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
                  )}
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href={sp.open === "true" ? `/directory/${city}` : `/directory/${city}?open=true`}
                className={cn(
                  "shrink-0 h-8 px-3 rounded text-xs font-medium border transition-colors flex items-center gap-1.5",
                  sp.open === "true" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Open now
              </Link>
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <Search className="w-10 h-10 text-gray-600 mx-auto" />
                  <h3 className="font-display text-xl text-gray-400">No results</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Try adjusting your filters or browse a different city.
                  </p>
                  <Link href={`/directory/${city}`}>
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                      Clear filters
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Result count */}
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-xs text-gray-500">
                      {filtered.length} {filtered.length === 1 ? "result" : "results"}
                    </p>
                    <div className="flex items-center gap-2 lg:hidden">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Filters</span>
                    </div>
                  </div>

                  {/* Restaurant cards - TripAdvisor style */}
                  {filtered.map((r, idx) => {
                    const { open, label } = isRestaurantOpen(r.openingHours);
                    const hasRating = r.reviewCount > 0;
                    const snippet = (r as { reviews?: { comment: string }[] }).reviews?.[0]?.comment || null;
                    const price = priceLevel(r.reviewCount);
                    const isTopRated = hasRating && r.averageOverall >= 4.5 && r.reviewCount >= 20;
                    const isTravelersChoice = hasRating && r.averageOverall >= 4.0 && r.reviewCount >= 50;

                    return (
                      <Link
                        key={r.id}
                        href={`/r/${r.slug}`}
                        className="group block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Image */}
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
                                <UtensilsCrossed className="w-8 h-8 text-gray-700" />
                              </div>
                            )}
                            {/* Award badge */}
                            {isTravelersChoice && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="brass" size="sm" className="text-[9px] px-1.5">
                                  Travelers&apos; Choice
                                </Badge>
                              </div>
                            )}
                            {isTopRated && !isTravelersChoice && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="herb" size="sm" className="text-[9px] px-1.5">
                                  Top Rated
                                </Badge>
                              </div>
                            )}
                            {r.logoUrl && (
                              <div className="absolute bottom-2 right-2 w-9 h-9 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shadow-lg">
                                <img src={r.logoUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
                            <div>
                              {/* Title + Rating row */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="font-display text-base sm:text-lg text-[#F3F3F3] group-hover:text-emerald-400 transition-colors truncate">
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
                                    <span className="text-xs font-medium text-[#F3F3F3]">{r.averageOverall.toFixed(1)}</span>
                                    <span className="text-[10px] text-gray-500">({r.reviewCount})</span>
                                  </div>
                                )}
                              </div>

                              {/* Meta */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="text-xs text-gray-400 font-medium">{CUISINES[idx % CUISINES.length]}</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-xs text-gray-400">{price}</span>
                                <span className="text-gray-600">·</span>
                                <span className={cn(
                                  "text-xs font-medium",
                                  open ? "text-emerald-400" : "text-gray-500"
                                )}>
                                  {open ? "Open now" : "Closed"}
                                </span>
                              </div>

                              {/* Review snippet */}
                              {snippet && (
                                <p className="text-sm text-gray-400 mt-3 line-clamp-2 leading-relaxed italic">
                                  &ldquo;{snippet}&rdquo;
                                </p>
                              )}
                            </div>

                            {/* Bottom */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                              <span className="text-[10px] text-gray-600">
                                {open && label ? `Closes ${label}` : ""}
                              </span>
                              <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                                View details <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Pagination */}
                  {filtered.length > 20 && (
                    <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                      {[1, 2, 3].map((page) => (
                        <span
                          key={page}
                          className={cn(
                            "w-9 h-9 flex items-center justify-center rounded text-sm font-medium cursor-pointer transition-colors",
                            page === 1 ? "bg-emerald-500 text-black" : "text-gray-400 hover:bg-gray-900"
                          )}
                        >
                          {page}
                        </span>
                      ))}
                      {filtered.length > 60 && (
                        <>
                          <span className="text-gray-600">…</span>
                          <span className="w-9 h-9 flex items-center justify-center rounded text-sm font-medium text-gray-400 hover:bg-gray-900 cursor-pointer transition-colors">
                            {Math.ceil(filtered.length / 20)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="border-t border-gray-800 py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F3F3F3]">
              Own a restaurant?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get discovered by diners across Rwanda. List your restaurant on Expaura and grow your reputation.
            </p>
            <button className="inline-flex items-center justify-center h-10 px-6 rounded text-sm font-medium border border-gray-700 text-[#F3F3F3] hover:bg-gray-800 transition-colors mt-2">
              Add your restaurant
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl text-[#F3F3F3]">
            Expaura
          </Link>
          <p className="text-xs text-gray-500 text-center">
            Connecting restaurants with their guests across Rwanda.
          </p>
          <span className="text-xs text-gray-600">Kigali, Rwanda</span>
        </div>
      </footer>
    </div>
  );
}
