"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Loader2, Layers } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { createPlan, updatePlan, deletePlan } from "@/lib/actions/subscriptions";
import { formatCurrencyRwf } from "@/lib/utils";

export interface PlanRow {
  id: string;
  name: string;
  priceMonthly: number;
  maxBranches: number;
  maxStaff: number;
  analyticsEnabled: boolean;
  aiSummaryEnabled: boolean;
  complaintsEnabled: boolean;
  employeeTrackingEnabled: boolean;
  subscriptionCount: number;
}

const FEATURES: { key: keyof Omit<PlanRow, "id" | "name" | "priceMonthly" | "maxBranches" | "maxStaff" | "subscriptionCount">; label: string }[] = [
  { key: "analyticsEnabled", label: "Analytics" },
  { key: "aiSummaryEnabled", label: "AI summary" },
  { key: "complaintsEnabled", label: "Complaints" },
  { key: "employeeTrackingEnabled", label: "Employee tracking" },
];

const EMPTY_FEATURES: Record<string, boolean> = {
  analyticsEnabled: false,
  aiSummaryEnabled: false,
  complaintsEnabled: false,
  employeeTrackingEnabled: false,
};

export function PlansManager({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PlanRow | null>(null);
  const [deleting, setDeleting] = React.useState<PlanRow | null>(null);
  const [name, setName] = React.useState("");
  const [priceMonthly, setPriceMonthly] = React.useState("");
  const [maxBranches, setMaxBranches] = React.useState("");
  const [maxStaff, setMaxStaff] = React.useState("");
  const [features, setFeatures] = React.useState<Record<string, boolean>>(EMPTY_FEATURES);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setPriceMonthly("");
    setMaxBranches("");
    setMaxStaff("");
    setFeatures(EMPTY_FEATURES);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (plan: PlanRow) => {
    setEditing(plan);
    setName(plan.name);
    setPriceMonthly(String(plan.priceMonthly));
    setMaxBranches(String(plan.maxBranches));
    setMaxStaff(String(plan.maxStaff));
    setFeatures({
      analyticsEnabled: plan.analyticsEnabled,
      aiSummaryEnabled: plan.aiSummaryEnabled,
      complaintsEnabled: plan.complaintsEnabled,
      employeeTrackingEnabled: plan.employeeTrackingEnabled,
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (Number(priceMonthly) < 0 || Number(maxBranches) < 1 || Number(maxStaff) < 0) {
      setError("Check the numeric values");
      return;
    }
    setSending(true);
    setError("");
    const payload = {
      name: name.trim(),
      priceMonthly: Number(priceMonthly),
      maxBranches: Number(maxBranches),
      maxStaff: Number(maxStaff),
      analyticsEnabled: features.analyticsEnabled,
      aiSummaryEnabled: features.aiSummaryEnabled,
      complaintsEnabled: features.complaintsEnabled,
      employeeTrackingEnabled: features.employeeTrackingEnabled,
    };
    try {
      if (editing) {
        await updatePlan({ id: editing.id, ...payload });
      } else {
        await createPlan(payload);
      }
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSending(true);
    setError("");
    try {
      await deletePlan({ id: deleting.id });
      setDeleting(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-primary">Plans</h2>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add plan
        </Button>
      </div>

      <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Branches</th>
                <th className="text-left px-4 py-3 font-medium">Staff</th>
                <th className="text-left px-4 py-3 font-medium">Features</th>
                <th className="text-right px-4 py-3 font-medium">Subscriptions</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary">
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-text-secondary" />
                      {plan.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary font-tabular">
                    {formatCurrencyRwf(plan.priceMonthly)}/mo
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-tabular">{plan.maxBranches}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-tabular">{plan.maxStaff}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {FEATURES.filter((f) => plan[f.key]).map((f) => (
                        <Badge key={f.key} variant="herb" size="sm">{f.label}</Badge>
                      ))}
                      {!FEATURES.some((f) => plan[f.key]) && (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-primary font-tabular">
                    {plan.subscriptionCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleting(plan);
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
              {plans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary text-sm">
                    No plans yet. Add one before recording subscriptions.
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
            <DialogTitle>{editing ? "Edit plan" : "Add a plan"}</DialogTitle>
            <DialogDescription>
              Plans define branch/staff limits and available features per restaurant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Name</Label>
              <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="plan-price">Price (RWF/mo)</Label>
                <Input id="plan-price" type="number" min="0" step="0.01" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} placeholder="45000" required />
              </div>
              <div>
                <Label htmlFor="plan-branches">Max branches</Label>
                <Input id="plan-branches" type="number" min="1" step="1" value={maxBranches} onChange={(e) => setMaxBranches(e.target.value)} placeholder="3" required />
              </div>
              <div>
                <Label htmlFor="plan-staff">Max staff</Label>
                <Input id="plan-staff" type="number" min="0" step="1" value={maxStaff} onChange={(e) => setMaxStaff(e.target.value)} placeholder="10" required />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-primary mb-2">Features</p>
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!features[f.key]}
                      onChange={(e) => setFeatures((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                      className="w-4 h-4 accent-purple-600"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              {editing ? "Save changes" : "Add plan"}
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
            <DialogTitle>Delete plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleting?.name}&quot;? This cannot be undone.
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
