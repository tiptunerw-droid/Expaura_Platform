import * as React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CreditCard, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate, formatCurrencyRwf } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      restaurant: true,
      plan: true,
      recorder: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const expiredCount = subscriptions.filter((s) => s.status === "EXPIRED").length;
  const pendingCount = subscriptions.filter((s) => s.status === "PENDING" || s.status === "PAUSED").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + Number(s.plan.priceMonthly), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Active</p>
              <p className="font-display text-xl text-ink">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Expired</p>
              <p className="font-display text-xl text-ink">{expiredCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Pending/Paused</p>
              <p className="font-display text-xl text-ink">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Monthly rev</p>
              <p className="font-display text-xl text-ink">{formatCurrencyRwf(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recorded by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <span className="font-medium text-ink">{s.restaurant.name}</span>
              </TableCell>
              <TableCell className="text-sm">{s.plan.name}</TableCell>
              <TableCell className="font-tabular text-sm">
                {formatCurrencyRwf(Number(s.plan.priceMonthly))}/mo
              </TableCell>
              <TableCell className="font-tabular text-xs">
                {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={s.status === "ACTIVE" ? "herb" : s.status === "EXPIRED" ? "rose" : "default"}
                  size="sm"
                >
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-ink-muted">
                {s.recorder?.name || "—"}
              </TableCell>
            </TableRow>
          ))}
          {subscriptions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-ink-muted py-8">
                No subscriptions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
