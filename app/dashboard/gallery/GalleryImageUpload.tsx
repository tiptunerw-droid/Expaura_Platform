"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addGalleryImage } from "@/lib/actions/gallery";

export function GalleryImageUpload() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter an image URL");
      return;
    }
    setSending(true);
    setError("");
    try {
      await addGalleryImage({ imageUrl: url.trim(), caption: caption.trim() || undefined });
      setUrl("");
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
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          Add photo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add gallery photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gallery-url">Image URL</Label>
            <Input id="gallery-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </div>
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Interior, patio, signature dish…" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Add to gallery
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
