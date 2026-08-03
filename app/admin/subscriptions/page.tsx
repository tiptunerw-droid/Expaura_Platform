import * as React from "react";
import { getAdminSubscriptionData } from "@/lib/actions/subscriptions";
import { formatCurrencyRwf } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlansManager } from "./PlansManager";
import { SubscriptionsManager } from "./SubscriptionsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
  let data;
  try {
    data = await getAdminSubscriptionData();
  } catch {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Unauthorized. Admin access required.</p>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Active</p>
              <p className="font-display text-xl text-ink">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Expired</p>
              <p className="font-display text-xl text-ink">{stats.expired}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Pending/Paused</p>
              <p className="font-display text-xl text-ink">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Monthly rev</p>
              <p className="font-display text-xl text-ink">{formatCurrencyRwf(stats.monthlyRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlansManager plans={data.plans} />
      <SubscriptionsManager
        subscriptions={data.subscriptions}
        restaurants={data.restaurants}
        plans={data.plans}
      />
    </div>
  );
}
