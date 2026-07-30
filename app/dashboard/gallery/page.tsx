import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listGallery } from "@/lib/actions/gallery";
import { GalleryImageUpload } from "./GalleryImageUpload";
import { DeleteGalleryImage } from "./DeleteGalleryImage";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const gallery = await listGallery(restaurant.id).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Photo gallery</h2>
          <p className="text-sm text-ink-muted mt-0.5">
            {gallery.length} photo{gallery.length !== 1 ? "s" : ""} · Displayed on your public page
          </p>
        </div>
        <GalleryImageUpload />
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-ceramic-deep rounded-lg overflow-hidden">
              <Image
                src={img.imageUrl}
                alt={img.caption || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[#ffffff] text-xs truncate">{img.caption}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteGalleryImage imageId={img.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Images className="w-full h-full" />}
          variant="neutral"
          title="No photos yet"
          description="Show off your restaurant's ambiance, dishes, and vibe with photos."
          action={<GalleryImageUpload />}
        />
      )}
    </div>
  );
}
