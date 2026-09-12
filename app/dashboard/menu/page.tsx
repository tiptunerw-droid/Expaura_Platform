import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listMenuImages } from "@/lib/actions/menu";
import { hasPermission } from "@/lib/auth/permissions";
import { MenuImageUpload } from "./MenuImageUpload";
import { MenuImageReorder } from "./MenuImageReorder";

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
        <MenuImageReorder images={menuImages} manageable={canManageMenu} />
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
