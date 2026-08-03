import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Search } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listDirectory } from "@/lib/actions/restaurants";
import { cn } from "@/lib/utils";
import { DirectoryBrowser } from "./DirectoryBrowser";

export const revalidate = 300;

interface DirectoryPageProps {
  params: Promise<{ city: string }>;
}

const CITIES = ["Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri", "Muhanga"];

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.toLowerCase() }));
}

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { city } = await params;
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);

  const allRestaurants = await listDirectory({ cityName: cityTitle });

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        {/* Hero */}
        <section className="border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Restaurants</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-text-primary leading-tight">
                  {cityTitle}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-bold text-text-primary">{allRestaurants.length}</span>{" "}
                  {allRestaurants.length === 1 ? "restaurant" : "restaurants"}
                </p>
              </div>
              <div className="relative w-full max-w-xs hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input placeholder="Search restaurants…" className="pl-9 h-9 bg-surface-alt border-gray-700 text-text-primary placeholder:text-gray-500 text-sm" />
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
                        !active && "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-text-primary"
                      )}
                    >
                      {c}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filterable content — hydrates client-side */}
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><div className="h-72 bg-surface-alt border border-border-subtle animate-pulse" /></div>}>
          <DirectoryBrowser city={cityTitle} restaurants={allRestaurants} />
        </Suspense>

        {/* CTA */}
        <section className="border-t border-border-subtle py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-text-primary">
              Own a restaurant?
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get discovered by diners across Rwanda. List your restaurant on Expaura and grow your reputation.
            </p>
            <button className="inline-flex items-center justify-center h-10 px-6 rounded text-sm font-medium border border-gray-700 text-text-primary hover:bg-gray-800 transition-colors mt-2">
              Add your restaurant
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl text-text-primary">
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
