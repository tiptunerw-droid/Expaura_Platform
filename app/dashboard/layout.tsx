import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/actions/auth";

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

  return (
    <DashboardShell
      userName={userName}
      userRole={userRole}
      restaurantName={restaurant?.name ?? ""}
      restaurantLogo={restaurant?.logoUrl ?? null}
    >
      {children}
    </DashboardShell>
  );
}
