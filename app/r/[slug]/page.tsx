import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin, Phone, MessageCircle, Globe, Clock, Star,
  UtensilsCrossed, Wifi, Car, Baby,
} from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { SiteHeader } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantTabs } from "./RestaurantTabs";
import { RatingDisplay } from "@/components/ui/rating";
import { SatisfactionAura } from "@/components/signature/SatisfactionAura";
import { QrReveal } from "@/components/public/qr-reveal";
import { getPublicRestaurantBySlug } from "@/lib/actions/restaurants";
import { listRestaurantReviews } from "@/lib/actions/reviews";
import { listMenuImages } from "@/lib/actions/menu";
import { listGallery } from "@/lib/actions/gallery";
import { isRestaurantOpen } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantPublicPage({ params }: Props) {
  const { slug } = await params;

  let restaurant;
  try {
    restaurant = await getPublicRestaurantBySlug(slug);
  } catch {
    notFound();
  }

  const rid = restaurant.id;
  const [reviews, menuImages, gallery] = await Promise.all([
    listRestaurantReviews({ restaurantId: rid, limit: 20 }),
    listMenuImages(rid),
    listGallery(rid),
  ]);

  const { open, label } = isRestaurantOpen(restaurant.openingHours);
  const hasReviews = restaurant.reviewCount > 0;

  const features = [
    { icon: UtensilsCrossed, label: "Cuisine", value: "African · Grill" },
    { icon: Wifi, label: "WiFi", value: "Free" },
    { icon: Car, label: "Parking", value: "Available" },
    { icon: Baby, label: "Family", value: "Friendly" },
    { icon: Phone, label: "Contact", value: restaurant.phone || "—" },
    { icon: MessageCircle, label: "WhatsApp", value: restaurant.whatsapp || "—" },
  ];

  const heroImages = gallery.slice(0, 3).map((g) => g.imageUrl);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted py-3 sm:py-4">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <Link href="/directory/kigali" className="hover:text-ink transition-colors">Search</Link>
            <span>/</span>
            <span className="text-ink">{restaurant.name}</span>
          </nav>

          {/* Asymmetric Hero Gallery */}
          <QrReveal restaurantName={restaurant.name}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:row-span-2 bg-ceramic-deep rounded-lg overflow-hidden">
                {restaurant.coverImageUrl ? (
                  <Image
                    src={restaurant.coverImageUrl}
                    alt={`${restaurant.name} interior`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 66vw"
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
              {heroImages.length >= 2 ? (
                <>
                  <div className="relative aspect-[4/3] bg-ceramic-deep rounded-lg overflow-hidden">
                    <Image
                      src={heroImages[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="relative aspect-[4/3] bg-ceramic-deep rounded-lg overflow-hidden">
                    <Image
                      src={heroImages[1]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative aspect-[4/3] bg-ceramic-deep rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-bl from-ceramic-deep to-line" />
                  </div>
                  <div className="relative aspect-[4/3] bg-ceramic-deep rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-ceramic-deep to-line" />
                  </div>
                </>
              )}
            </div>

            {/* Main Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 md:mt-10">
              {/* Left: Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title Block */}
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-sm text-ink-muted">
                      <MapPin className="w-4 h-4" style={{ color: "#d9465b" }} />
                      <span className="text-ink-soft">{restaurant.city?.name || "Kigali"}</span>
                      {restaurant.address && <span className="text-ink-muted">· {restaurant.address}</span>}
                    </div>
                    {hasReviews && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-brass text-brass" />
                        <span className="font-medium text-sm text-brass">
                          {restaurant.averageOverall.toFixed(1)}
                        </span>
                        <span className="text-xs text-ink-muted">
                          ({restaurant.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed mt-3 max-w-xl">
                    Wood-fired grills, a rooftop view over {restaurant.city?.name || "Kigali"}, and a menu built around what&apos;s fresh that morning.
                  </p>
                  <button className="text-xs text-ink-muted hover:text-ink transition-colors mt-1 underline underline-offset-2">
                    Read more
                  </button>
                </div>

                {/* Featured Info Grid (Restaurant Features) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {features.slice(0, 6).map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex items-center gap-3 p-3 bg-white border border-line rounded-lg">
                        <Icon className="w-4 h-4 text-ink-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-ink-muted">{f.label}</p>
                          <p className="text-sm text-ink font-medium truncate">{f.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary Info Card (Opening Hours & Practical Info) */}
                <div className="bg-white border border-line rounded-lg p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-ink-muted" />
                    <div>
                      <p className="text-sm text-ink font-medium">
                        {open ? "Open now" : "Closed"}
                      </p>
                      {label && (
                        <p className="text-xs text-ink-muted">{label}</p>
                      )}
                    </div>
                  </div>
                  {restaurant.email && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-ink-muted" />
                      <p className="text-sm text-ink-soft">{restaurant.email}</p>
                    </div>
                  )}
                </div>

                {/* Dark Featured Card — AI Review Summary */}
                {hasReviews && (
                  <div className="dark-section rounded-lg p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg text-[#fafaf8]">What guests are saying</h2>
                      <SatisfactionAura rating={restaurant.averageOverall} size={48} />
                    </div>
                    <p className="text-sm text-[#9e9e9e] leading-relaxed">
                      Guests consistently praise the {restaurant.averageFood > 4 ? "exceptional food quality" : "well-prepared dishes"} and the{" "}
                      {restaurant.averageService > 4 ? "attentive, warm service" : "friendly staff"}. The atmosphere is{" "}
                      {restaurant.averageAtmosphere > 4 ? "vibrant and inviting" : "pleasant and comfortable"}.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#9e9e9e]">
                      <span className="flex items-center gap-1">
                        Food <RatingDisplay value={restaurant.averageFood} size="sm" />
                      </span>
                      <span className="flex items-center gap-1">
                        Service <RatingDisplay value={restaurant.averageService} size="sm" />
                      </span>
                      <span className="flex items-center gap-1">
                        Atmosphere <RatingDisplay value={restaurant.averageAtmosphere} size="sm" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Restaurant Tabs (Menu / Reviews / Gallery / Report) */}
                <RestaurantTabs
                  restaurantId={rid}
                  menuImages={menuImages}
                  reviews={reviews}
                  gallery={gallery}
                  hasReviews={hasReviews}
                  averageFood={restaurant.averageFood}
                  averageService={restaurant.averageService}
                  averageAtmosphere={restaurant.averageAtmosphere}
                  averageCleanliness={restaurant.averageCleanliness}
                />
              </div>

              {/* Right: Sticky Sidebar Card */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-white border border-line rounded-lg p-5 space-y-4">
                    <h3 className="font-display text-lg text-ink">Quick actions</h3>
                    <div className="space-y-2">
                      <Button variant="primary" size="lg" className="w-full">
                        View Digital Menu
                      </Button>
                      <Button variant="outline" size="default" className="w-full">
                        Leave a review
                      </Button>
                      <Button variant="outline" size="default" className="w-full">
                        Report an issue
                      </Button>
                    </div>
                    {hasReviews && (
                      <div className="pt-3 border-t border-line">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-muted">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-brass text-brass" />
                            <span className="font-medium text-ink">{restaurant.averageOverall.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-ink-muted">Reviews</span>
                          <span className="text-ink font-medium">{restaurant.reviewCount}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social / Contact Mini Section */}
                  <div className="bg-white border border-line rounded-lg p-4 space-y-3">
                    <h4 className="text-xs uppercase tracking-wider text-ink-muted">Connect</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {restaurant.phone && (
                        <a href={`tel:${restaurant.phone}`}>
                          <Button variant="outline" size="icon">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      {restaurant.whatsapp && (
                        <a
                          href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="icon">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
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
          </QrReveal>
        </div>

        {/* Full-bleed CTA Break */}
        <section className="dark-section mt-12 sm:mt-16 py-16 sm:py-20 text-center">
          <div className="max-w-lg mx-auto px-4 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl text-[#fafaf8]">
              Get your restaurant on Expaura
            </h2>
            <p className="text-sm text-[#9e9e9e] leading-relaxed">
              Join Rwanda's fastest-growing dining platform. Digital menus, guest feedback, and staff insights — all in one place.
            </p>
            <Button variant="outline" size="lg" className="mt-2 border-[#fafaf8]/30 text-[#fafaf8] hover:bg-[#fafaf8]/10">
              List your restaurant
            </Button>
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
