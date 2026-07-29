import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { ProfileTabs } from "./ProfileTabs";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-ink-muted">Unauthorized.</p>
        <Link href="/login"><Button className="mt-4">Log in</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileTabs restaurant={restaurant} />
    </div>
  );
}
