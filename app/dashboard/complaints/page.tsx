import * as React from "react";
import Link from "next/link";
import {
  AlertCircle, Search, Clock, CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getManagerPlanFeatures } from "@/lib/actions/restaurants";
import { listRestaurantComplaints } from "@/lib/actions/complaints";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";
import { ComplaintStatus } from "@/generated/prisma/client";
import { UpdateComplaintStatus } from "./UpdateStatus";
import { FeatureLock } from "@/components/dashboard/feature-lock";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Closed",
};

const statusColor: Record<string, "ember" | "brass" | "herb" | "rose"> = {
  PENDING: "ember",
  IN_PROGRESS: "brass",
  RESOLVED: "herb",
  REJECTED: "rose",
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input placeholder="Search complaints…" className="pl-9 h-9" />
        </div>
        <div className="flex gap-2">
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
      </div>

      {complaints.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {canManageComplaints ? <TableHead className="w-32">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Badge variant="outline" size="sm">{c.category?.name || "—"}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {c.description}
                </TableCell>
                <TableCell className="text-sm">
                  {c.employee?.name || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColor[c.status]} size="sm">
                    {statusLabel[c.status]}
                  </Badge>
                </TableCell>
                <TableCell className="font-tabular text-xs">
                  {formatDate(c.createdAt)}
                </TableCell>
                {canManageComplaints ? (
                  <TableCell>
                    <UpdateComplaintStatus
                      complaintId={c.id}
                      currentStatus={c.status}
                    />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<CheckCircle className="w-full h-full" />}
          variant="complaint"
          titleClassName="text-ink"
          title="No complaints"
          description={
            sp.status
              ? `No complaints with status "${statusLabel[sp.status] || sp.status}".`
              : "No complaints yet. When customers report issues, they appear here."
          }
        />
      )}
    </div>
  );
}
