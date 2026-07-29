import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ArrowRight, UtensilsCrossed } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCities } from "@/lib/actions/data";
import { listDirectory } from "@/lib/actions/restaurants";
import { listRecentlyAdded } from "@/lib/actions/restaurants";

export const dynamic = "force-dynamic";

export default async function DirectoryIndexPage() {
  const { cities } = await getCities();
  const recent = await listRecentlyAdded(6);

  const cityCounts: Record<string, number> = {};
  await Promise.all(
    cities.map(async (c) => {
      try {
        const restaurants = await listDirectory({ cityName: c.name });
        cityCounts[c.name] = restaurants.length;
      } catch {
        cityCounts[c.name] = 0;
      }
    })
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3]">
      <SiteHeader />
      <main className="pt-24 flex-1">
        {/* Hero */}
        <section className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Explore</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#F3F3F3] leading-tight">
              Restaurants in Rwanda
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
              Discover the best dining experiences across the country. Browse by city and find your next meal.
            </p>
          </div>
        </section>

        {/* City Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="font-display text-xl text-[#F3F3F3] mb-6">Browse by city</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities
              .sort((a, b) => (cityCounts[b.name] || 0) - (cityCounts[a.name] || 0))
              .map((c) => {
                const count = cityCounts[c.name] || 0;
                return (
                  <Link
                    key={c.id}
                    href={`/directory/${c.name.toLowerCase()}`}
                    className="group block bg-gray-900 border border-gray-800 rounded-lg p-5 sm:p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-lg text-[#F3F3F3] group-hover:text-emerald-400 transition-colors">
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
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                      <span className="text-xs text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                        Browse restaurants <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Recently Added */}
        {recent.length > 0 && (
          <section className="border-t border-gray-800 py-10 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-xl text-[#F3F3F3] mb-6">Recently added</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recent.map((r) => (
                  <Link key={r.id} href={`/r/${r.slug}`} className="group block">
                    <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group-hover:border-gray-700 transition-colors relative">
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
                    <h3 className="text-sm font-medium text-[#F3F3F3] mt-2 group-hover:text-emerald-400 transition-colors truncate">
                      {r.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">{r.city?.name || "Kigali"}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-gray-800 py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F3F3F3]">
              Own a restaurant?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get discovered by diners across Rwanda. List your restaurant on Expaura and grow your reputation.
            </p>
            <Button variant="outline" size="lg" className="border-gray-700 text-[#F3F3F3] hover:bg-gray-800 mt-2">
              Add your restaurant
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl text-[#F3F3F3]">Expaura</Link>
          <p className="text-xs text-gray-500 text-center">Connecting restaurants with their guests across Rwanda.</p>
          <span className="text-xs text-gray-600">Kigali, Rwanda</span>
        </div>
      </footer>
    </div>
  );
}
