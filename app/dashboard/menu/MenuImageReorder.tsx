"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateMenuImageOrder } from "@/lib/actions/menu";
import { DeleteMenuImage } from "./DeleteMenuImage";

interface MenuImage {
  id: string;
  imageUrl: string;
}

interface Props {
  images: MenuImage[];
  manageable?: boolean;
}

export function MenuImageReorder({ images, manageable = false }: Props) {
  const router = useRouter();
  const [items, setItems] = React.useState(images);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [knownIds, setKnownIds] = React.useState(images.map((i) => i.id).join(","));

  const imageIds = images.map((i) => i.id).join(",");
  if (imageIds !== knownIds) {
    setKnownIds(imageIds);
    setItems(images);
    setError("");
  }

  const applyOrder = async (next: MenuImage[], movedId: string) => {
    setError("");
    setSavingId(movedId);
    setItems(next);
    try {
      await updateMenuImageOrder(next.map((img, idx) => ({ id: img.id, position: idx })));
      router.refresh();
    } catch (e) {
      setItems(images);
      setError((e as Error).message || "Could not reorder menu pages.");
    } finally {
      setSavingId(null);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void applyOrder(next, items[index].id);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((img, idx) => (
          <Card key={img.id} className="overflow-hidden group">
            <div className="relative aspect-[3/4] bg-ceramic-deep">
              <Image
                src={img.imageUrl}
                alt={`Menu page ${idx + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute top-2 left-2">
                <Badge variant="default" size="sm">
                  Page {idx + 1}
                </Badge>
              </div>
              {manageable ? (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteMenuImage imageId={img.id} />
                </div>
              ) : null}
            </div>
            {manageable ? (
              <div className="flex items-center justify-between p-2 border-t border-border-subtle">
                <span className={cn("text-xs text-ink-muted", savingId === img.id && "opacity-50")}>
                  {savingId === img.id ? "Saving…" : `Page ${idx + 1}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0 || savingId !== null}
                    aria-label={`Move page ${idx + 1} up`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1 || savingId !== null}
                    aria-label={`Move page ${idx + 1} down`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
      {manageable && items.length > 1 && (
        <p className="text-xs text-ink-muted">
          Use the arrows to set the order customers see when they scan the QR code.
        </p>
      )}
    </div>
  );
}