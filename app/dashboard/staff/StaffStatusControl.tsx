"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setStaffStatus } from "@/lib/actions/staff";

interface Props {
  staffId: string;
  isActive: boolean;
  memberName: string;
}

export function StaffStatusControl({ staffId, isActive, memberName }: Props) {
  const router = useRouter();
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleToggle = async () => {
    if (
      !confirm(
        isActive
          ? `Revoke access for ${memberName}? They will no longer be able to log in.`
          : `Grant access to ${memberName}?`
      )
    ) {
      return;
    }
    setSending(true);
    setError("");
    try {
      await setStaffStatus({ staffId, isActive: !isActive });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive ? "destructive" : "outline"}
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={handleToggle}
        disabled={sending}
      >
        {sending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isActive ? (
          <Ban className="w-3 h-3" />
        ) : (
          <RotateCcw className="w-3 h-3" />
        )}
        {isActive ? "Revoke" : "Grant"}
      </Button>
      {error && <span className="text-[10px] text-rose">{error}</span>}
    </div>
  );
}
