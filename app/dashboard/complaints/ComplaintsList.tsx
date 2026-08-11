"use client";

import * as React from "react";
import { CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { UpdateComplaintStatus } from "./UpdateStatus";

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

interface Complaint {
  id: string;
  description: string;
  status: string;
  tableNumber?: string | null;
  receiptNumber?: string | null;
  createdAt: Date | string;
  category?: { id: string; name: string } | null;
  employee?: { id: string; name: string } | null;
}

interface ComplaintsListProps {
  complaints: Complaint[];
  canManageComplaints: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

export function ComplaintsList({
  complaints,
  canManageComplaints,
  emptyTitle,
  emptyDescription,
}: ComplaintsListProps) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const filtered = q
    ? complaints.filter((c) =>
        [
          c.description,
          c.category?.name,
          c.employee?.name,
          statusLabel[c.status],
          c.tableNumber,
          c.receiptNumber,
        ].some((v) => v?.toLowerCase().includes(q))
      )
    : complaints;

  return (
    <>
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search complaints…"
          className="pl-9 h-9"
        />
      </div>

      {complaints.length > 0 && q ? (
        <p className="text-xs text-ink-muted font-tabular">
          {filtered.length} of {complaints.length} complaints
        </p>
      ) : null}

      {filtered.length > 0 ? (
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
            {filtered.map((c) => (
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
          title={q ? "No matches" : emptyTitle}
          description={q ? `No complaints match "${query.trim()}". Try a different search.` : emptyDescription}
        />
      )}
    </>
  );
}
