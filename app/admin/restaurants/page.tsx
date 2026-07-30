import * as React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, Search, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Restaurants" };

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; plan?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};

  if (sp.status === "active") where.isActive = true;
  else if (sp.status === "inactive") where.isActive = false;

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: {
      city: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = restaurants.map((r) => ({
    ...r,
    currentSub: r.subscriptions[0] || null,
  }));

  let filtered = enriched;
  if (sp.city) {
    filtered = filtered.filter((r) => r.city.name.toLowerCase() === sp.city?.toLowerCase());
  }
  if (sp.plan) {
    filtered = filtered.filter((r) => r.currentSub?.plan?.name === sp.plan);
  }

  const activeCount = enriched.filter((r) => r.isActive).length;
  const inactiveCount = enriched.filter((r) => !r.isActive).length;
  const paidCount = enriched.filter((r) => r.currentSub?.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-herb-soft flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-herb" />
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Active</p>
              <p className="font-display text-xl text-ink">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-soft flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-rose" />
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Inactive</p>
              <p className="font-display text-xl text-ink">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brass-soft flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-brass" />
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Paying</p>
              <p className="font-display text-xl text-ink">{paidCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input placeholder="Search restaurants…" className="pl-9 h-9" />
        </div>
        <div className="flex gap-2">
          {["", "active", "inactive"].map((s) => (
            <Link key={s} href={`/admin/restaurants${s ? `?status=${s}` : ""}`}>
              <Badge
                variant={(!sp.status && !s) || sp.status === s ? "default" : "outline"}
                size="sm"
                className="cursor-pointer"
              >
                {s ? (s === "active" ? "Active" : "Inactive") : "All"}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Sub status</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <span className="font-medium text-ink">{r.name}</span>
              </TableCell>
              <TableCell className="text-sm">{r.city?.name || "—"}</TableCell>
              <TableCell>
                <Badge variant={r.isActive ? "herb" : "default"} size="sm">
                  {r.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {r.currentSub?.plan?.name || "—"}
              </TableCell>
              <TableCell>
                {r.currentSub ? (
                  <Badge
                    variant={r.currentSub.status === "ACTIVE" ? "herb" : r.currentSub.status === "EXPIRED" ? "rose" : "default"}
                    size="sm"
                  >
                    {r.currentSub.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-ink-muted">None</span>
                )}
              </TableCell>
              <TableCell className="font-tabular text-xs">
                {formatDate(r.createdAt)}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-ink-muted py-8">
                No restaurants match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
