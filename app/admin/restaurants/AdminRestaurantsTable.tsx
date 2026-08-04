"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { setRestaurantStatus, revokeRestaurant } from "@/lib/actions/admin-restaurants";

export interface RestaurantRow {
  id: string;
  name: string;
  cityName: string | null;
  isActive: boolean;
  planName: string | null;
  subStatus: string | null;
  createdAt: Date | string;
}

interface Props {
  restaurants: RestaurantRow[];
}

export function AdminRestaurantsTable({ restaurants }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const runAction = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {error && (
        <p className="text-xs text-rose bg-rose-soft px-3 py-2 rounded">Error: {error}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Sub status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((r) => {
            const busy = busyId === r.id;
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="font-medium text-ink">{r.name}</span>
                </TableCell>
                <TableCell className="text-sm">{r.cityName || "—"}</TableCell>
                <TableCell>
                  <Badge variant={r.isActive ? "herb" : "default"} size="sm">
                    {r.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{r.planName || "—"}</TableCell>
                <TableCell>
                  {r.subStatus ? (
                    <Badge
                      variant={r.subStatus === "ACTIVE" ? "herb" : r.subStatus === "EXPIRED" ? "rose" : "default"}
                      size="sm"
                    >
                      {r.subStatus}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-muted">None</span>
                  )}
                </TableCell>
                <TableCell className="font-tabular text-xs">
                  {formatDate(r.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={r.isActive ? "outline" : "brass"}
                      disabled={busy}
                      onClick={() =>
                        runAction(r.id, () =>
                          setRestaurantStatus({ restaurantId: r.id, isActive: !r.isActive })
                        )
                      }
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {r.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    {r.subStatus === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        title="Deactivate and cancel the active subscription"
                        onClick={() => runAction(r.id, () => revokeRestaurant({ restaurantId: r.id }))}
                      >
                        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldX className="w-3 h-3" />}
                        Revoke
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {restaurants.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-ink-muted py-8">
                No restaurants match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
