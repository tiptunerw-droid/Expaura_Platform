import { redirect, notFound } from "next/navigation";
import { getPublicRestaurantByQr } from "@/lib/actions/restaurants";
import { SiteHeader } from "@/components/site/header";
import { DataUnavailableNotice } from "@/components/public/data-unavailable-notice";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function QrRedirectPage({ params }: Props) {
  const { code } = await params;

  let restaurant;
  try {
    restaurant = await getPublicRestaurantByQr(code);
  } catch {
    notFound();
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-surface text-text-primary">
        <SiteHeader />
        <main className="pt-24 flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <DataUnavailableNotice label="this restaurant" />
          </div>
        </main>
      </div>
    );
  }

  redirect(`/r/${restaurant.slug}?tab=menu&source=qr`);
}