import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminRestaurantsTable } from "./AdminRestaurantsTable";
import { AdminRestaurantsSearch } from "./AdminRestaurantsSearch";

export const metadata = { title: "Restaurants" };

interface SearchParams {
  city?: string;
  plan?: string;
  status?: string;
  sub?: string;
  search?: string;
}

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};

  if (sp.status === "active") where.isActive = true;
  else if (sp.status === "inactive") where.isActive = false;
  if (sp.search) where.name = { contains: sp.search, mode: "insensitive" };

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
  if (sp.sub === "subscribed") {
    filtered = filtered.filter((r) => r.currentSub?.status === "ACTIVE");
  } else if (sp.sub === "free") {
    filtered = filtered.filter((r) => r.currentSub?.status !== "ACTIVE");
  }

  const activeCount = enriched.filter((r) => r.isActive).length;
  const inactiveCount = enriched.filter((r) => !r.isActive).length;
  const paidCount = enriched.filter((r) => r.currentSub?.status === "ACTIVE").length;

  const baseParams = new URLSearchParams();
  if (sp.city) baseParams.set("city", sp.city);
  if (sp.plan) baseParams.set("plan", sp.plan);
  if (sp.sub) baseParams.set("sub", sp.sub);
  if (sp.search) baseParams.set("search", sp.search);

  const filterHref = (key: string, value: string) => {
    const next = new URLSearchParams(baseParams);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return `/admin/restaurants${qs ? `?${qs}` : ""}`;
  };

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
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Subscribed</p>
              <p className="font-display text-xl text-ink">{paidCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Suspense fallback={<div className="relative flex-1 min-w-[200px] max-w-xs h-9 bg-ceramic-deep animate-pulse rounded" />}>
          <AdminRestaurantsSearch defaultValue={sp.search || ""} />
        </Suspense>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-2">
            {["", "active", "inactive"].map((s) => (
              <Link key={s} href={filterHref("status", s)}>
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
          <div className="w-px h-5 bg-line mx-1" />
          <div className="flex gap-2">
            {["", "subscribed", "free"].map((s) => (
              <Link key={s} href={filterHref("sub", s)}>
                <Badge
                  variant={(!sp.sub && !s) || sp.sub === s ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                >
                  {s ? (s === "subscribed" ? "Subscribed" : "Free") : "All subs"}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AdminRestaurantsTable
        restaurants={filtered.map((r) => ({
          id: r.id,
          name: r.name,
          cityName: r.city?.name || null,
          isActive: r.isActive,
          planName: r.currentSub?.plan?.name || null,
          subStatus: r.currentSub?.status || null,
          createdAt: r.createdAt,
        }))}
      />
    </div>
  );
}
