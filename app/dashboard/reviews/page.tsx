import * as React from "react";
import Link from "next/link";
import { Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingDisplay } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listRestaurantReviews } from "@/lib/actions/reviews";
import { formatRelative } from "@/lib/utils";

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
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input placeholder="Search reviews…" className="pl-9 h-9" />
        </div>
        <span className="text-xs text-ink-muted font-tabular">{reviews.length} total</span>
      </div>

      {reviews.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Recommend</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <RatingDisplay value={r.overallRating} size="sm" />
                </TableCell>
                <TableCell className="max-w-sm truncate text-sm">
                  {r.comment || <span className="text-ink-muted italic">No comment</span>}
                </TableCell>
                <TableCell>
                  {r.wouldRecommend !== null ? (
                    <Badge variant={r.wouldRecommend ? "herb" : "rose"} size="sm">
                      {r.wouldRecommend ? "Yes" : "No"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{r.tableNumber || "—"}</TableCell>
                <TableCell className="font-tabular text-xs">{formatRelative(r.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<Star className="w-full h-full" />}
          variant="review"
          title="No reviews yet"
          description="When customers leave feedback, it shows up here. Share your QR code to collect reviews."
        />
      )}
    </div>
  );
}
