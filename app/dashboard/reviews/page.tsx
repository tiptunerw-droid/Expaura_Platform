import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listManagerReviews } from "@/lib/actions/reviews";
import { ReviewsList } from "./ReviewsList";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  try {
    await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const reviews = await listManagerReviews({
    limit: 200,
  });

  return (
    <div className="space-y-6">
      <ReviewsList reviews={reviews} />
    </div>
  );
}
