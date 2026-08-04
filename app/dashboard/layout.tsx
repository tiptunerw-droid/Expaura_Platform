import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/actions/auth";
import { getManagerPlanFeatures } from "@/lib/actions/restaurants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentUser();
  if (!result.authenticated || !result.user) {
    redirect("/login");
  }

  const userName = result.user.name;
  const userRole =
    result.user.platformRole === "SUPER_ADMIN"
      ? "Super Admin"
      : "Restaurant Manager";
  const restaurant = result.restaurant;

  let planFeatures = {
    planName: "Free",
    analyticsEnabled: false,
    aiSummaryEnabled: false,
    complaintsEnabled: false,
    employeeTrackingEnabled: false,
  };
  try {
    planFeatures = await getManagerPlanFeatures();
  } catch {
    // Unauthenticated already handled above; fall back to no features.
  }

  return (
    <DashboardShell
      userName={userName}
      userRole={userRole}
      restaurantName={restaurant?.name ?? ""}
      restaurantLogo={restaurant?.logoUrl ?? null}
      planFeatures={planFeatures}
    >
      {children}
    </DashboardShell>
  );
}
