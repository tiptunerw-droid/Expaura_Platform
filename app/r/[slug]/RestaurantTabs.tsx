"use client";

import * as React from "react";
import Image from "next/image";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RatingDisplay } from "@/components/ui/rating";
import { ReviewForm } from "@/components/public/ReviewForm";
import { ComplaintForm } from "@/components/public/ComplaintForm";
import { formatRelative } from "@/lib/utils";

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
}: Props) {
  const [tab, setTab] = React.useState("menu");

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="menu" className="flex-1">Menu</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1">Gallery</TabsTrigger>
          <TabsTrigger value="report" className="flex-1">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <div className="space-y-4">
            {menuImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {menuImages.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white rounded-lg border border-line overflow-hidden"
                  >
                    <div className="relative aspect-[3/4] bg-ceramic-deep">
                      <Image
                        src={img.imageUrl}
                        alt="Menu page"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 640px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-ink-muted">
                <p className="text-sm">Menu not yet available online.</p>
              </div>
            )}
          </div>
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
                    className="bg-white rounded-lg border border-line p-3 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                      {item.label}
                    </p>
                    <p className="font-display text-xl text-ink mt-0.5">
                      {item.value.toFixed(1)}
                    </p>
                    <RatingDisplay value={item.value} size="sm" />
                  </div>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">
                  Leave a review
                </CardTitle>
                <p className="text-xs text-ink-muted">
                  No account needed — takes 30 seconds
                </p>
              </CardHeader>
              <CardContent>
                <ReviewForm restaurantId={restaurantId} />
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg text-ink">
                  Recent reviews
                </h3>
                {reviews.slice(0, 10).map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-lg border border-line p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <RatingDisplay value={review.overallRating} size="sm" />
                      <span className="text-[10px] text-ink-muted font-tabular">
                        {formatRelative(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-ink-soft leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
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
                <p className="text-sm text-ink-muted">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {gallery.map((img) => (
                <div key={img.id} className="relative aspect-square bg-ceramic-deep rounded-lg overflow-hidden">
                  <Image
                    src={img.imageUrl}
                    alt={img.caption || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 320px"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-muted">
              <p className="text-sm">No gallery photos yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ember-soft flex items-center justify-center">
                  <Shield className="w-4 h-4 text-ember" />
                </div>
                <div>
                  <CardTitle className="text-base font-display">
                    Report an issue
                  </CardTitle>
                  <p className="text-xs text-ink-muted">
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
      </Tabs>
    </>
  );
}
