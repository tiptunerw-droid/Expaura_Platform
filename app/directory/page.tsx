import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { MapPin, Star, ArrowRight, UtensilsCrossed } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCities } from "@/lib/actions/data";
import { getCityRestaurantCounts, listRecentlyAdded } from "@/lib/actions/restaurants";

export const revalidate = 300;

async function CityGrid() {
  const [{ cities }, cityCounts] = await Promise.all([
    getCities(),
    getCityRestaurantCounts(),
  ]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h2 className="font-display text-xl text-text-primary mb-6">Browse by city</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities
          .sort((a, b) => (cityCounts[b.name] || 0) - (cityCounts[a.name] || 0))
          .map((c) => {
            const count = cityCounts[c.name] || 0;
            return (
              <Link
                key={c.id}
                href={`/directory/${c.name.toLowerCase()}`}
                className="group block bg-surface-alt border border-border-subtle rounded-lg p-5 sm:p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-text-primary group-hover:text-emerald-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.region || c.country}
                    </p>
                  </div>
                  <Badge variant="dark" size="sm">
                    {count} {count === 1 ? "place" : "places"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                  <span className="text-xs text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                    Browse restaurants <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
}

function CityGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse">
      <h2 className="font-display text-xl text-text-primary mb-6">Browse by city</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-alt border border-border-subtle rounded-lg p-5 sm:p-6 space-y-3">
            <div className="h-5 w-24 bg-gray-800 rounded" />
            <div className="h-3 w-16 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

async function RecentlyAdded() {
  const recent = await listRecentlyAdded(6);

  if (recent.length === 0) return null;

  return (
    <section className="border-t border-border-subtle py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl text-text-primary mb-6">Recently added</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recent.map((r) => (
            <Link key={r.id} href={`/r/${r.slug}`} className="group block">
              <div className="aspect-[4/3] bg-surface-alt rounded-lg overflow-hidden border border-border-subtle group-hover:border-gray-700 transition-colors relative">
                {r.coverImageUrl ? (
                  <Image src={r.coverImageUrl} alt={r.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300" sizes="(max-width: 768px) 50vw, 16vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-gray-700" />
                  </div>
                )}
                {r.reviewCount > 0 && r.averageOverall >= 4 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="brass" size="sm" className="text-[9px] px-1.5 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-brass" /> {r.averageOverall.toFixed(1)}
                    </Badge>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-text-primary mt-2 group-hover:text-emerald-400 transition-colors truncate">
                {r.name}
              </h3>
              <p className="text-[10px] text-gray-500">{r.city?.name || "Kigali"}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentlyAddedSkeleton() {
  return (
    <section className="border-t border-border-subtle py-10 sm:py-14 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl text-text-primary mb-6">Recently added</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/3] bg-surface-alt rounded-lg" />
              <div className="h-4 w-3/4 bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DirectoryIndexPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        {/* Hero — static, renders immediately */}
        <section className="border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Explore</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-text-primary leading-tight">
              Restaurants in Rwanda
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
              Discover the best dining experiences across the country. Browse by city and find your next meal.
            </p>
          </div>
        </section>

        {/* City Grid — streams in while counts load */}
        <Suspense fallback={<CityGridSkeleton />}>
          <CityGrid />
        </Suspense>

        {/* Recently Added — streams in independently */}
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded />
        </Suspense>

        {/* CTA — static */}
        <section className="border-t border-border-subtle py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-text-primary">
              Own a restaurant?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get discovered by diners across Rwanda. List your restaurant on Expaura and grow your reputation.
            </p>
            <Button variant="outline" size="lg" className="border-gray-700 text-text-primary hover:bg-gray-800 mt-2">
              Add your restaurant
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl text-text-primary">Expaura</Link>
          <p className="text-xs text-gray-500 text-center">Connecting restaurants with their guests across Rwanda.</p>
          <span className="text-xs text-gray-600">Kigali, Rwanda</span>
        </div>
      </footer>
    </div>
  );
}
