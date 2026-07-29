"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMenuImage } from "@/lib/actions/menu";

interface Props {
  restaurantId: string;
  branchId?: string;
}

export function MenuImageUpload({ restaurantId, branchId }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
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
      await addMenuImage({
        imageUrl: url.trim(),
        branchId,
      });
      setUrl("");
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
          Add menu page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add menu page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/…"
            />
            <p className="text-[10px] text-ink-muted mt-1">
              Upload to Cloudinary first, then paste the URL here.
            </p>
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Add to menu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
