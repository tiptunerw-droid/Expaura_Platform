import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  MapPin, Phone, MessageCircle, Star,
  ArrowRight, UtensilsCrossed,
} from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantTabs } from "./RestaurantTabs";
import { SatisfactionAura } from "@/components/signature/SatisfactionAura";
import { getPublicRestaurantBySlug, listRecentlyAdded } from "@/lib/actions/restaurants";
import { listRestaurantReviews } from "@/lib/actions/reviews";
import { listMenuImages } from "@/lib/actions/menu";
import { listGallery } from "@/lib/actions/gallery";
import { isRestaurantOpen, cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; source?: string }>;
}

function StarBubbles({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            sizes[size],
            s <= Math.round(rating) ? "fill-brass text-brass" : "text-gray-700"
          )}
        />
      ))}
    </div>
  );
}

function RatingBreakdown({ label, value }: { label: string; value: number }) {
  const pct = value > 0 ? (value / 5) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-text-primary w-6 text-right">{value > 0 ? value.toFixed(1) : "—"}</span>
    </div>
  );
}

async function RestaurantHero({ slug, initialTab, source }: { slug: string; initialTab?: string; source?: string }) {
  let restaurant;
  try {
    restaurant = await getPublicRestaurantBySlug(slug);
  } catch {
    notFound();
  }

  const { open, label } = isRestaurantOpen(restaurant.openingHours);
  const hasReviews = restaurant.reviewCount > 0;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 py-6 md:py-8">
        <div className="relative w-full md:w-80 h-48 md:h-56 rounded-lg overflow-hidden bg-surface-alt shrink-0">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt={`${restaurant.name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={open ? "dark" : "outline"} size="sm">
              {open ? "Open now" : "Closed"}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start gap-4">
            {restaurant.logoUrl && (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                <Image src={restaurant.logoUrl} alt={`${restaurant.name} logo`} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-text-primary leading-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-sm text-gray-400">
                  {restaurant.city?.name || "Kigali"}
                  {restaurant.address && <span className="text-gray-600"> · {restaurant.address}</span>}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" size="sm" className="border-gray-700 text-gray-300">International</Badge>
                <Badge variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  {restaurant.reviewCount > 50 ? "$$$$" : restaurant.reviewCount > 10 ? "$$$" : "$$"}
                </Badge>
                {hasReviews && restaurant.averageOverall >= 4.5 && (
                  <Badge variant="brass" size="sm">Travelers&apos; Choice</Badge>
                )}
              </div>
            </div>
          </div>
          {hasReviews && (
            <div className="flex items-center gap-3 mt-4">
              <StarBubbles rating={restaurant.averageOverall} size="lg" />
              <span className="text-2xl font-bold text-text-primary">{restaurant.averageOverall.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({restaurant.reviewCount} {restaurant.reviewCount === 1 ? "review" : "reviews"})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className={open ? "text-emerald-400" : "text-gray-500"}>{open ? "Open now" : "Closed"}</span>
            {label && <span className="text-gray-500">· {label}</span>}
          </div>
        </div>
      </div>
      <RestaurantContentSection restaurantId={restaurant.id} restaurant={restaurant} initialTab={initialTab} source={source} />
    </>
  );
}

async function RestaurantContentSection({ restaurantId, restaurant, initialTab, source }: { restaurantId: string; restaurant: Awaited<ReturnType<typeof getPublicRestaurantBySlug>>; initialTab?: string; source?: string }) {
  const [reviews, menuImages, gallery, similar] = await Promise.all([
    listRestaurantReviews({ restaurantId, limit: 20 }),
    listMenuImages(restaurantId),
    listGallery(restaurantId),
    listRecentlyAdded(4),
  ]);

  const hasReviews = restaurant.reviewCount > 0;
  const cityLower = restaurant.city?.name?.toLowerCase() || "kigali";
  const canInteract = source === "qr";

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {hasReviews && (
          <div className="bg-surface-alt border border-border-subtle rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-text-primary">What guests are saying</h2>
              <SatisfactionAura rating={restaurant.averageOverall} size={48} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Guests consistently praise the {restaurant.averageFood > 4 ? "exceptional food quality" : "well-prepared dishes"} and the{" "}
              {restaurant.averageService > 4 ? "attentive, warm service" : "friendly staff"}. The atmosphere is{" "}
              {restaurant.averageAtmosphere > 4 ? "vibrant and inviting" : "pleasant and comfortable"}.
            </p>
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <RatingBreakdown label="Food" value={restaurant.averageFood} />
              <RatingBreakdown label="Service" value={restaurant.averageService} />
              <RatingBreakdown label="Atmosphere" value={restaurant.averageAtmosphere} />
              <RatingBreakdown label="Cleanliness" value={restaurant.averageCleanliness} />
            </div>
          </div>
        )}

        <RestaurantTabs
          restaurantId={restaurantId}
          menuImages={menuImages}
          reviews={reviews}
          gallery={gallery}
          hasReviews={hasReviews}
          averageFood={restaurant.averageFood}
          averageService={restaurant.averageService}
          averageAtmosphere={restaurant.averageAtmosphere}
          averageCleanliness={restaurant.averageCleanliness}
          initialTab={initialTab}
          canInteract={canInteract}
        />
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          {canInteract && (
            <div className="bg-surface-alt border border-border-subtle rounded-lg p-5 space-y-4">
              <h3 className="font-display text-lg text-text-primary">Quick actions</h3>
              <div className="space-y-2">
                <Link href="?tab=menu" scroll={false}>
                  <Button variant="primary" size="lg" className="w-full">
                    View Digital Menu
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="?tab=reviews" scroll={false}>
                  <Button variant="outline" size="default" className="w-full">
                    Leave a review
                  </Button>
                </Link>
                <Link href="?tab=report" scroll={false}>
                  <Button variant="outline" size="default" className="w-full">
                    Report an issue
                  </Button>
                </Link>
              </div>

              {hasReviews && (
                <div className="pt-3 border-t border-border-subtle space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Rating</span>
                    <StarBubbles rating={restaurant.averageOverall} size="sm" />
                  </div>
                  {[
                    { label: "Food", value: restaurant.averageFood },
                    { label: "Service", value: restaurant.averageService },
                    { label: "Atmosphere", value: restaurant.averageAtmosphere },
                    { label: "Cleanliness", value: restaurant.averageCleanliness },
                  ].filter((r) => r.value > 0).map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-text-primary font-medium">{item.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-surface-alt border border-border-subtle rounded-lg p-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-gray-500">Connect</h4>
            <div className="flex flex-wrap items-center gap-2">
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`}>
                  <Button variant="outline" size="icon"><Phone className="w-4 h-4" /></Button>
                </a>
              )}
              {restaurant.whatsapp && (
                <a href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon"><MessageCircle className="w-4 h-4" /></Button>
                </a>
              )}
              {restaurant.instagramUrl && (
                <SocialIcon url={restaurant.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36 }} />
              )}
              {restaurant.facebookUrl && (
                <SocialIcon url={restaurant.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36 }} />
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
    {similar.length > 0 && (
      <section className="mt-12 sm:mt-16 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-text-primary">Similar restaurants</h2>
          <Link href={`/directory/${cityLower}`} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {similar.filter((s) => s.id !== restaurantId).slice(0, 4).map((s) => (
            <Link key={s.id} href={`/r/${s.slug}`} className="group block">
              <div className="aspect-[4/3] bg-surface-alt rounded-lg overflow-hidden border border-border-subtle group-hover:border-gray-700 transition-colors">
                {s.coverImageUrl ? (
                  <Image src={s.coverImageUrl} alt={s.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-gray-700" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-text-primary mt-2 group-hover:text-emerald-400 transition-colors truncate">
                {s.name}
              </h3>
              <p className="text-[10px] text-gray-500">{s.city?.name || "Kigali"}</p>
            </Link>
          ))}
        </div>
      </section>
    )}
    </>
  );
}

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 bg-surface-alt rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-surface-alt rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-alt rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-surface-alt rounded-lg" />
          <div className="h-24 bg-surface-alt rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default async function RestaurantPublicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Suspense fallback={
            <div className="animate-pulse py-8">
              <div className="flex gap-8">
                <div className="w-80 h-56 bg-surface-alt rounded-lg shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-64 bg-surface-alt rounded" />
                  <div className="h-4 w-48 bg-surface-alt rounded" />
                </div>
              </div>
              <ContentSkeleton />
            </div>
          }>
            <RestaurantHero slug={slug} initialTab={sp.tab} source={sp.source} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
