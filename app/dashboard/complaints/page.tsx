import * as React from "react";
import Link from "next/link";
import {
  AlertCircle, Clock, CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getManagerPlanFeatures } from "@/lib/actions/restaurants";
import { listRestaurantComplaints } from "@/lib/actions/complaints";
import { hasPermission } from "@/lib/auth/permissions";
import { ComplaintStatus } from "@/generated/prisma/client";
import { FeatureLock } from "@/components/dashboard/feature-lock";
import { ComplaintsList } from "./ComplaintsList";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Closed",
};

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const sp = await searchParams;
  try {
    await getManagerRestaurant();
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-ink-muted">Unauthorized. Please log in.</p>
        <Link href="/login"><Button variant="primary" className="mt-4">Log in</Button></Link>
      </div>
    );
  }

  const features = await getManagerPlanFeatures();
  if (!features.complaintsEnabled) {
    return (
      <FeatureLock
        title="Complaint management"
        description="Reviewing and resolving customer complaints is included in the Standard and Premium plans. Upgrade to unlock."
      />
    );
  }

  const complaints = await listRestaurantComplaints({
    status: sp.status as ComplaintStatus | undefined,
    categoryId: sp.category || undefined,
  }).catch(() => []);

  const canManageComplaints = await hasPermission("MANAGE_COMPLAINTS");

  const pendingCount = complaints.filter((c) => c.status === "PENDING").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">Pending</p>
              <p className="font-display text-xl text-ink">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">In progress</p>
              <p className="font-display text-xl text-ink">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">Resolved</p>
              <p className="font-display text-xl text-ink">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["", "PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((s) => (
          <Link key={s} href={`/dashboard/complaints${s ? `?status=${s}` : ""}`}>
            <Badge
              variant={sp.status === s || (!sp.status && !s) ? "default" : "outline"}
              size="sm"
              className="cursor-pointer"
            >
              {s ? statusLabel[s] : "All"}
            </Badge>
          </Link>
        ))}
      </div>

      <ComplaintsList
        complaints={complaints}
        canManageComplaints={canManageComplaints}
        emptyTitle="No complaints"
        emptyDescription={
          sp.status
            ? `No complaints with status "${statusLabel[sp.status] || sp.status}".`
            : "No complaints yet. When customers report issues, they appear here."
        }
      />
    </div>
  );
}
