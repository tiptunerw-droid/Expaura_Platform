"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { addGalleryImage } from "@/lib/actions/gallery";

export function GalleryImageUpload() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [caption, setCaption] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleUploaded = async (url: string) => {
    setSending(true);
    setError("");
    try {
      await addGalleryImage({ imageUrl: url, caption: caption.trim() || undefined });
      setCaption("");
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
        Add photo
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add gallery photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CloudinaryUpload onUploaded={handleUploaded} />
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Interior, patio, signature dish…" />
          </div>
          {sending && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
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
