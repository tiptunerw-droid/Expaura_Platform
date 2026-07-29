import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star } from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listDirectory } from "@/lib/actions/restaurants";
import { isRestaurantOpen, cn } from "@/lib/utils";

interface DirectoryPageProps {
  params: Promise<{ city: string }>;
}

const CITIES = ["Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri", "Muhanga"];

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { city } = await params;
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  const restaurants = await listDirectory({ cityName: cityTitle });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Title Section */}
        <section className="border-b border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" style={{ color: "#d9465b" }} />
                  <span className="text-xs text-ink-muted uppercase tracking-wider">Directory</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
                  Restaurants in {cityTitle}
                </h1>
                <p className="text-sm text-ink-soft mt-1">
                  {restaurants.length} {restaurants.length === 1 ? "spot" : "spots"} found
                </p>
              </div>
              <div className="relative max-w-sm w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <Input placeholder="Search in this city…" className="pl-10" />
              </div>
            </div>

            {/* City pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {CITIES.map((c) => {
                const active = c.toLowerCase() === city.toLowerCase();
                return (
                  <Link key={c} href={`/directory/${c.toLowerCase()}`}>
                    <Badge
                      variant={active ? "dark" : "outline"}
                      className="h-8 px-3.5 text-sm transition-colors cursor-pointer"
                    >
                      {c}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Discovery Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {restaurants.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <MapPin className="w-8 h-8 text-ink-muted mx-auto" />
              <h3 className="font-display text-xl text-ink">No restaurants yet</h3>
              <p className="text-sm text-ink-soft max-w-sm mx-auto">
                We haven&apos;t found any restaurants in {cityTitle} yet. Check back soon or browse another city.
              </p>
              <Link href="/">
                <Badge variant="outline" className="mt-2 cursor-pointer">
                  Back to home
                </Badge>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {restaurants.map((r) => {
                const { open } = isRestaurantOpen(r.openingHours);
                const hasRating = r.reviewCount > 0;
                return (
                  <Link
                    key={r.id}
                    href={`/r/${r.slug}`}
                    className="group block bg-white border border-line rounded-lg overflow-hidden transition-all hover:border-line-strong"
                  >
                    <div className="relative aspect-[4/3] bg-ceramic-deep">
                      {r.coverImageUrl ? (
                        <Image
                          src={r.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-ceramic-deep to-line" />
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="dark" size="sm">
                          {hasRating && r.averageOverall >= 4 ? "Top Rated" : r.reviewCount > 5 ? "Featured" : "New"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-display text-base text-ink leading-tight group-hover:text-ink/70 transition-colors">
                        {r.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-ink-muted">
                        <MapPin className="w-3 h-3 shrink-0" style={{ color: "#d9465b" }} />
                        {r.city?.name || "Kigali"}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-line">
                        {hasRating ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                            <span className="text-xs font-medium text-ink">{r.averageOverall.toFixed(1)}</span>
                            <span className="text-[10px] text-ink-muted">({r.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink-muted">No reviews yet</span>
                        )}
                        {open && (
                          <Badge variant="dark" size="sm" className="text-[9px]">
                            Open
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Full-bleed CTA Break */}
        <section className="dark-section py-14 sm:py-16 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-[#fafaf8]">
              Own a restaurant?
            </h2>
            <p className="text-sm text-[#9e9e9e] leading-relaxed">
              Get discovered by diners across Rwanda. List your restaurant on Expaura and grow your reputation.
            </p>
            <button className="inline-flex items-center justify-center h-10 px-5 rounded text-sm font-medium border border-[#fafaf8]/30 text-[#fafaf8] hover:bg-[#fafaf8]/10 transition-colors mt-2">
              Add your restaurant
            </button>
          </div>
        </section>
      </main>

      {/* Footer — dark bar */}
      <footer className="dark-section border-t border-[#fafaf8]/10 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl text-[#fafaf8]">
            Expaura
          </Link>
          <p className="text-xs text-[#9e9e9e] text-center">
            Connecting restaurants with their guests across Rwanda.
          </p>
          <div className="flex items-center gap-2">
            <SocialIcon url="https://instagram.com/expaura_rw" target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28 }} />
            <SocialIcon url="https://twitter.com/expaura_rw" target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28 }} />
          </div>
        </div>
      </footer>
    </>
  );
}
