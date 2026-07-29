"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMenuImage } from "@/lib/actions/menu";

interface Props {
  imageId: string;
}

export function DeleteMenuImage({ imageId }: Props) {
  const router = useRouter();
  const [sending, setSending] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this menu page?")) return;
    setSending(true);
    try {
      await deleteMenuImage(imageId);
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
      aria-label="Delete menu image"
    >
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
