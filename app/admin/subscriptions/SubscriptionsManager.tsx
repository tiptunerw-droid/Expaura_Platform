"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/lib/actions/subscriptions";
import { formatCurrencyRwf, formatDate } from "@/lib/utils";

export interface SubscriptionRow {
  id: string;
  restaurantId: string;
  restaurantName: string;
  planId: string;
  planName: string;
  priceMonthly: number;
  periodStart: Date;
  periodEnd: Date;
  status: SubscriptionStatusValue;
  recordedByName: string | null;
  createdAt: Date;
}

interface RestaurantOption {
  id: string;
  name: string;
}

interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
}

const SUBSCRIPTION_STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING", "PAUSED"] as const;
type SubscriptionStatusValue = (typeof SUBSCRIPTION_STATUSES)[number];
const STATUSES: SubscriptionStatusValue[] = [...SUBSCRIPTION_STATUSES];

function toDateInput(value: Date | string): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function SubscriptionsManager({
  subscriptions,
  restaurants,
  plans,
}: {
  subscriptions: SubscriptionRow[];
  restaurants: RestaurantOption[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubscriptionRow | null>(null);
  const [deleting, setDeleting] = React.useState<SubscriptionRow | null>(null);
  const [restaurantId, setRestaurantId] = React.useState("");
  const [planId, setPlanId] = React.useState("");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [status, setStatus] = React.useState<SubscriptionStatusValue>("ACTIVE");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const openCreate = () => {
    setEditing(null);
    setRestaurantId("");
    setPlanId("");
    setPeriodStart("");
    setPeriodEnd("");
    setStatus("ACTIVE");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (sub: SubscriptionRow) => {
    setEditing(sub);
    setRestaurantId(sub.restaurantId);
    setPlanId(sub.planId);
    setPeriodStart(toDateInput(sub.periodStart));
    setPeriodEnd(toDateInput(sub.periodEnd));
    setStatus(sub.status);
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !planId || !periodStart || !periodEnd) {
      setError("All fields are required");
      return;
    }
    setSending(true);
    setError("");
    const payload = { restaurantId, planId, periodStart, periodEnd, status };
    try {
      if (editing) {
        await updateSubscription({ id: editing.id, ...payload });
      } else {
        await createSubscription(payload);
      }
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subscription");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSending(true);
    setError("");
    try {
      await deleteSubscription({ id: deleting.id });
      setDeleting(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subscription");
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-primary">Subscriptions</h2>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Record subscription
        </Button>
      </div>

      <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                <th className="text-left px-4 py-3 font-medium">Restaurant</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Recorded by</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary font-medium">{sub.restaurantName}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{sub.planName}</td>
                  <td className="px-4 py-3 text-sm text-primary font-tabular">
                    {formatCurrencyRwf(sub.priceMonthly)}/mo
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary font-tabular whitespace-nowrap">
                    {formatDate(sub.periodStart)} – {formatDate(sub.periodEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.status === "ACTIVE" ? "herb" : sub.status === "EXPIRED" ? "rose" : "default"} size="sm">
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {sub.recordedByName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(sub)}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleting(sub);
                          setError("");
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary text-sm">
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit subscription" : "Record a subscription"}</DialogTitle>
            <DialogDescription>
              Link a restaurant to a plan for a billing period.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sub-restaurant">Restaurant</Label>
              <Select id="sub-restaurant" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} required>
                <option value="">Select a restaurant…</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-plan">Plan</Label>
              <Select id="sub-plan" value={planId} onChange={(e) => setPlanId(e.target.value)} required>
                <option value="">Select a plan…</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {formatCurrencyRwf(p.priceMonthly)}/mo</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sub-start">Period start</Label>
                <Input id="sub-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="sub-end">Period end</Label>
                <Input id="sub-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="sub-status">Status</Label>
              <Select id="sub-status" value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatusValue)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {editing ? "Save changes" : "Record subscription"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subscription for &quot;{deleting?.restaurantName}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-rose">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={sending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={sending}>
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
