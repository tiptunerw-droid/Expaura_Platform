import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listRestaurantReviews } from "@/lib/actions/reviews";
import { ReviewsList } from "./ReviewsList";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const reviews = await listRestaurantReviews({
    restaurantId: restaurant.id,
    limit: 200,
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <ReviewsList reviews={reviews} />
    </div>
  );
}
