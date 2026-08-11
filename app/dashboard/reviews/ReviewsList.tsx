"use client";

import * as React from "react";
import { Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingDisplay } from "@/components/ui/rating";
import { formatRelative } from "@/lib/utils";

interface Review {
  id: string;
  overallRating: number;
  comment?: string | null;
  wouldRecommend?: boolean | null;
  tableNumber?: string | null;
  createdAt: Date | string;
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const filtered = q
    ? reviews.filter((r) =>
        [
          r.comment,
          r.tableNumber,
          r.wouldRecommend === true ? "yes" : r.wouldRecommend === false ? "no" : null,
          String(r.overallRating),
        ].some((v) => v?.toLowerCase().includes(q))
      )
    : reviews;

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews…"
            className="pl-9 h-9"
          />
        </div>
        <span className="text-xs text-ink-muted font-tabular">
          {q ? `${filtered.length} of ${reviews.length}` : `${reviews.length} total`}
        </span>
      </div>

      {filtered.length > 0 ? (
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
            {filtered.map((r) => (
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
          title={q ? "No matches" : "No reviews yet"}
          description={
            q
              ? `No reviews match "${query.trim()}". Try a different search.`
              : "When customers leave feedback, it shows up here. Share your QR code to collect reviews."
          }
        />
      )}
    </>
  );
}
