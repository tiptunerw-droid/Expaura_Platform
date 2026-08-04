import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getCurrentUser } from "@/lib/actions/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { ProfileTabs } from "./ProfileTabs";
import { UserProfileForm } from "./UserProfileForm";

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

  const auth = await getCurrentUser();
  const canManageSettings = await hasPermission("MANAGE_SETTINGS");
  const canManageQr = await hasPermission("MANAGE_QR");

  return (
    <div className="space-y-6 max-w-3xl">
      {auth.authenticated && auth.user ? (
        <UserProfileForm user={{ name: auth.user.name, email: auth.user.email }} />
      ) : null}
      <ProfileTabs
        restaurant={restaurant}
        canManageSettings={canManageSettings}
        canManageQr={canManageQr}
      />
    </div>
  );
}
