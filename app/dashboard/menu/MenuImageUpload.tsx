"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { addMenuImage } from "@/lib/actions/menu";

interface Props {
  branchId?: string;
}

export function MenuImageUpload({ branchId }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleUploaded = async (url: string) => {
    setSending(true);
    setError("");
    try {
      await addMenuImage({ imageUrl: url, branchId });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        Add menu page
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add menu page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CloudinaryUpload onUploaded={handleUploaded} />
          {sending && (
            <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </div>
          )}
          {error && <p className="text-xs text-rose">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
