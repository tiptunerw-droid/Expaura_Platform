"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RatingDisplay } from "@/components/ui/rating";
import { ReviewForm } from "@/components/public/ReviewForm";
import { ComplaintForm } from "@/components/public/ComplaintForm";
import { formatRelative, cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface MenuImage {
  id: string;
  imageUrl: string;
}

interface Review {
  id: string;
  overallRating: number;
  foodRating?: number | null;
  serviceRating?: number | null;
  wouldRecommend?: boolean | null;
  comment?: string | null;
  createdAt: Date | string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface Props {
  restaurantId: string;
  menuImages: MenuImage[];
  reviews: Review[];
  gallery: GalleryImage[];
  hasReviews: boolean;
  averageFood: number;
  averageService: number;
  averageAtmosphere: number;
  averageCleanliness: number;
  initialTab?: string;
  canInteract?: boolean;
}

export function RestaurantTabs({
  restaurantId,
  menuImages,
  reviews,
  gallery,
  hasReviews,
  averageFood,
  averageService,
  averageAtmosphere,
  averageCleanliness,
  initialTab,
  canInteract = true,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const availableTabs = canInteract
    ? ["menu", "reviews", "gallery", "report"]
    : ["menu", "reviews", "gallery"];

  const tab = tabFromUrl && availableTabs.includes(tabFromUrl)
    ? tabFromUrl
    : initialTab && availableTabs.includes(initialTab)
      ? initialTab
      : "menu";

  const setTab = React.useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<{ images: { id: string; imageUrl: string; caption?: string | null }[]; index: number } | null>(null);

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.children[0]?.clientWidth || 380;
    container.scrollBy({ left: -itemWidth - 16, behavior: "smooth" });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.children[0]?.clientWidth || 380;
    container.scrollBy({ left: itemWidth + 16, behavior: "smooth" });
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    setActiveIndex(index);
  };

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollPos = container.scrollLeft;
      const itemWidth = container.children[0]?.clientWidth || 380;
      const gap = 16;
      const idx = Math.round(scrollPos / (itemWidth + gap));
      setActiveIndex(Math.min(idx, menuImages.length - 1));
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [menuImages.length]);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full">
        <TabsTrigger value="menu" className="flex-1">Menu</TabsTrigger>
        <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
        <TabsTrigger value="gallery" className="flex-1">Gallery</TabsTrigger>
        {canInteract && <TabsTrigger value="report" className="flex-1">Report</TabsTrigger>}
      </TabsList>

      <TabsContent value="menu">
        {menuImages.length > 0 ? (
          <div className="relative group">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {menuImages.map((img, i) => (
                <div key={img.id} className="snap-center shrink-0 w-[80vw] sm:w-[380px] first:ml-0 last:mr-0">
                  <button
                    onClick={() => setLightbox({ images: menuImages, index: i })}
                    className="relative aspect-[3/4] bg-surface-alt rounded-lg border border-border-subtle overflow-hidden w-full cursor-pointer group"
                  >
                    <Image
                      src={img.imageUrl}
                      alt="Menu page"
                      fill
                      className="object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                      sizes="380px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
            {menuImages.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-alt/90 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-800 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-alt/90 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-800 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="flex justify-center gap-1.5 mt-3">
              {menuImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === activeIndex ? "bg-emerald-400 w-4" : "bg-gray-700 hover:bg-gray-600"
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Menu not yet available online.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews">
        <div className="space-y-6">
          {hasReviews && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Food", value: averageFood },
                { label: "Service", value: averageService },
                { label: "Atmosphere", value: averageAtmosphere },
                { label: "Cleanliness", value: averageCleanliness },
              ].filter((r) => r.value > 0).map((item) => (
                <div
                  key={item.label}
                  className="bg-surface-alt rounded-lg border border-border-subtle p-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    {item.label}
                  </p>
                  <p className="font-display text-xl text-text-primary mt-0.5">
                    {item.value.toFixed(1)}
                  </p>
                  <RatingDisplay value={item.value} size="sm" />
                </div>
              ))}
            </div>
          )}

          {canInteract && (
            <Card className="bg-surface-alt border-border-subtle">
              <CardHeader>
                <CardTitle className="text-base font-display">
                  Leave a review
                </CardTitle>
                <p className="text-xs text-gray-500">
                  No account needed — takes 30 seconds
                </p>
              </CardHeader>
              <CardContent>
                <ReviewForm restaurantId={restaurantId} />
              </CardContent>
            </Card>
          )}

          {reviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg text-text-primary">
                Recent reviews
              </h3>
              {reviews.slice(0, 10).map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-alt rounded-lg border border-border-subtle p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <RatingDisplay value={review.overallRating} size="sm" />
                    <span className="text-[10px] text-gray-500 font-tabular">
                      {formatRelative(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                    {review.wouldRecommend !== null && (
                      <span>
                        {review.wouldRecommend
                          ? "Would recommend"
                          : "Would not recommend"}
                      </span>
                    )}
                    {review.foodRating && (
                      <span>Food: {review.foodRating}/5</span>
                    )}
                    {review.serviceRating && (
                      <span>Service: {review.serviceRating}/5</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasReviews && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="gallery">
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox({ images: gallery, index: i })}
                className="relative aspect-square bg-surface-alt rounded-lg overflow-hidden cursor-pointer group text-left"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.caption || ""}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 320px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {img.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No gallery photos yet.</p>
          </div>
        )}
      </TabsContent>

      {canInteract && (
        <TabsContent value="report">
          <Card className="bg-surface-alt border-border-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ember-soft flex items-center justify-center">
                  <Shield className="w-4 h-4 text-ember" />
                </div>
                <div>
                  <CardTitle className="text-base font-display">
                    Report an issue
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Help the manager address problems quickly
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ComplaintForm restaurantId={restaurantId} />
            </CardContent>
          </Card>
        </TabsContent>
      )}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </Tabs>
  );
}
