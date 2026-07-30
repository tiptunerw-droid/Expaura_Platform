import { redirect, notFound } from "next/navigation";
import { getPublicRestaurantByQr } from "@/lib/actions/restaurants";

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

  redirect(`/r/${restaurant.slug}?tab=menu&source=qr`);
}
