import Link from "next/link";
import { Search, QrCode, Star, ChefHat, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listFeatured, listRecentlyAdded } from "@/lib/actions/restaurants";
import { cn } from "@/lib/utils";

const CITIES = ["Kigali", "Butare", "Gisenyi", "Musanze", "Ruhengeri", "Muhanga"];

export default async function HomePage() {
  const featured = await listFeatured(6);
  const recentlyAdded = await listRecentlyAdded(12);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <Badge variant="dark" size="sm">
                  <ChefHat className="w-3 h-3 mr-1" />
                  Rwanda&apos;s restaurant directory
                </Badge>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-ink leading-tight">
                  Find your next favorite spot, from Nyamirambo brochettes to Gisenyi lakefront dining.
                </h1>
                <p className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-xl">
                  Honest reviews, QR menus, and real-time feedback from guests who ate there last night.
                  Expaura is built for how Rwanda actually eats out.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <Input
                    placeholder="Search restaurants, cuisines, neighborhoods…"
                    className="pl-10 h-12"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <Link key={city} href={`/directory/${city.toLowerCase()}`}>
                      <Badge variant="outline" className="h-8 px-3.5 text-sm cursor-pointer transition-colors hover:border-line-strong">
                        {city}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
                      Network
                    </span>
                    <span className="font-display text-xl text-ink">4.6</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Restaurants", value: "142" },
                      { label: "Reviews (30d)", value: "3,847" },
                      { label: "QR scans today", value: "1,129" },
                      { label: "Response rate", value: "92%", highlight: true },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between py-0.5">
                        <span className="text-sm text-ink-soft">{stat.label}</span>
                        <span className={cn("font-tabular text-sm font-medium", stat.highlight ? "text-ink" : "text-ink")}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-line">
                    <Link href="/qr/demo">
                      <Button variant="outline" size="sm" className="w-full">
                        <QrCode className="w-4 h-4" />
                        Try the demo QR
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12" id="directory">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Badge variant="dark" size="sm" className="mb-2">
                Loved this week
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
                Featured restaurants
              </h2>
            </div>
            <Link href="/directory/kigali" className="text-sm text-ink-muted hover:text-ink transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((r) => (
              <RestaurantCard
                key={r.id}
                slug={r.slug}
                name={r.name}
                cityName={r.city?.name}
                coverImageUrl={r.coverImageUrl}
                logoUrl={r.logoUrl}
                averageOverall={r.averageOverall}
                reviewCount={r.reviewCount}
                openingHours={r.openingHours}
              />
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Badge variant="dark" size="sm" className="mb-2">
                Just joined
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
                Recently added
              </h2>
            </div>
            <Link href="/directory/kigali" className="text-sm text-ink-muted hover:text-ink transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:lg:grid-cols-4 sm:overflow-visible">
            {recentlyAdded.map((r) => (
              <div key={r.id} className="shrink-0 w-[260px] sm:w-auto sm:shrink">
                <RestaurantCard
                  slug={r.slug}
                  name={r.name}
                  cityName={r.city?.name}
                  coverImageUrl={r.coverImageUrl}
                  logoUrl={r.logoUrl}
                  averageOverall={r.averageOverall}
                  reviewCount={r.reviewCount}
                  openingHours={r.openingHours}
                  compact
                />
              </div>
            ))}
          </div>
        </section>

        {/* Full-bleed CTA */}
        <section className="dark-section mt-8 py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-[#fafaf8]">
              Own a restaurant?
            </h2>
            <p className="text-sm text-[#9e9e9e] leading-relaxed">
              Join Rwanda&apos;s fastest-growing dining platform. Digital menus, guest feedback, and staff insights — all in one place.
            </p>
            <Button variant="outline" size="lg" className="mt-2 border-[#fafaf8]/30 text-[#fafaf8] hover:bg-[#fafaf8]/10">
              Get started
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
