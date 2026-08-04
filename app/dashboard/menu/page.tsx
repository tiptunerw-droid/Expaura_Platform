import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listMenuImages } from "@/lib/actions/menu";
import { hasPermission } from "@/lib/auth/permissions";
import { MenuImageUpload } from "./MenuImageUpload";
import { DeleteMenuImage } from "./DeleteMenuImage";

export const metadata = { title: "Menu" };

export default async function MenuPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const canManageMenu = await hasPermission("MANAGE_MENU");

  const rid = restaurant.id;
  const menuImages = await listMenuImages(rid).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Digital menu</h2>
          <p className="text-sm text-ink-muted mt-0.5">
            {menuImages.length} page{menuImages.length !== 1 ? "s" : ""} · Customers see these when they scan the QR
          </p>
        </div>
        {canManageMenu ? <MenuImageUpload /> : null}
      </div>

      {menuImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuImages.map((img, idx) => (
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
                {canManageMenu ? (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteMenuImage imageId={img.id} />
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UtensilsCrossed className="w-full h-full" />}
          variant="menu"
          title="No menu pages yet"
          description="Upload photos of your menu — customers will see them when they scan the QR code at your restaurant."
          action={
            canManageMenu ? <MenuImageUpload /> : undefined
          }
        />
      )}
    </div>
  );
}
