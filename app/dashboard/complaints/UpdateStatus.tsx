"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateComplaintStatus } from "@/lib/actions/complaints";

const statusFlow = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

const statusIcon: Record<string, React.ReactNode> = {
  PENDING: <AlertCircle className="w-3.5 h-3.5" />,
  IN_PROGRESS: <Clock className="w-3.5 h-3.5" />,
  RESOLVED: <CheckCircle className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Closed",
};

interface Props {
  complaintId: string;
  currentStatus: string;
}

export function UpdateComplaintStatus({ complaintId, currentStatus }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const currentIdx = statusFlow.indexOf(currentStatus);

  const handleUpdate = async (status: string) => {
    setSending(true);
    try {
      await updateComplaintStatus({ id: complaintId, status: status as any });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      setOpen(false);
    }
  };

  const nextStatuses = statusFlow.slice(currentIdx + 1);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={() => setOpen((v) => !v)}
        disabled={sending}
      >
        {sending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          statusIcon[currentStatus]
        )}
        {statusLabel[currentStatus]}
        <ChevronDown className="w-3 h-3" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-line py-1 z-20">
            {nextStatuses.length > 0 ? (
              nextStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleUpdate(s)}
                  className="w-full text-left px-3 py-1.5 text-sm text-ink-soft hover:bg-ceramic-deep flex items-center gap-2"
                >
                  {statusIcon[s]}
                  {statusLabel[s]}
                </button>
              ))
            ) : (
              <p className="px-3 py-1.5 text-xs text-ink-muted">No further actions</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
