import * as React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listBranches } from "@/lib/actions/branches";
import { formatDate } from "@/lib/utils";
import { AddBranchDialog } from "./AddBranchDialog";

export const metadata = { title: "Branches" };

export default async function BranchesPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const branches = await listBranches(restaurant.id).catch(() => []);
  const plan = restaurant.currentSubscription?.plan;
  const maxBranches = plan?.maxBranches ?? 1;
  const canAdd = branches.length < maxBranches;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Branches & locations</h2>
          <p className="text-sm text-ink-muted mt-0.5">
            {branches.length} of {maxBranches} branches used
          </p>
        </div>
        {canAdd ? (
          <AddBranchDialog />
        ) : (
          <Link href="/dashboard/profile#subscription">
            <Button variant="brass" size="sm">Upgrade for more</Button>
          </Link>
        )}
      </div>

      {branches.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-ink">{b.name}</TableCell>
                <TableCell className="text-sm">{b.city?.name || "—"}</TableCell>
                <TableCell className="text-sm text-ink-muted max-w-xs truncate">
                  {b.address || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={b.isActive ? "herb" : "default"} size="sm">
                    {b.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="font-tabular text-xs">{formatDate(b.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<Building2 className="w-full h-full" />}
          variant="neutral"
          title="No branches yet"
          description="Add multiple locations to manage them all from one dashboard."
          action={canAdd ? <AddBranchDialog /> : undefined}
        />
      )}
    </div>
  );
}
