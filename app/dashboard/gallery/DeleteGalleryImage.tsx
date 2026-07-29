"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGalleryImage } from "@/lib/actions/gallery";

interface Props {
  imageId: string;
}

export function DeleteGalleryImage({ imageId }: Props) {
  const router = useRouter();
  const [sending, setSending] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this photo from the gallery?")) return;
    setSending(true);
    try {
      await deleteGalleryImage(imageId);
      router.refresh();
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      className="h-8 w-8"
      onClick={handleDelete}
      disabled={sending}
      aria-label="Delete gallery image"
    >
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
