import * as React from "react";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getManagerPlanFeatures } from "@/lib/actions/restaurants";
import { listEmployees } from "@/lib/actions/employees";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { FeatureLock } from "@/components/dashboard/feature-lock";

export const metadata = { title: "Employees" };

export default async function EmployeesPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const canManageEmployees = await hasPermission("MANAGE_EMPLOYEES");

  const features = await getManagerPlanFeatures();
  if (!features.employeeTrackingEnabled) {
    return (
      <FeatureLock
        title="Employee tracking"
        description="Tracking waiters and staff performance is included in the Premium plan. Upgrade to unlock."
      />
    );
  }

  const employees = await listEmployees(restaurant.id).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Employees</h2>
          <p className="text-sm text-ink-muted mt-0.5">
            {employees.length} employee{employees.length !== 1 ? "s" : ""} · Track service performance
          </p>
        </div>
        {canManageEmployees ? <AddEmployeeDialog /> : null}
      </div>

      {employees.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Open complaints</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium text-ink">{emp.name}</TableCell>
                <TableCell className="text-sm">{emp.jobTitle || "—"}</TableCell>
                <TableCell>
                  <Badge variant={emp.isActive ? "herb" : "default"} size="sm">
                    {emp.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-tabular text-sm ${
                    emp.pendingComplaints === 0 ? "text-herb" : "text-ember"
                  }`}>
                    {emp.pendingComplaints}
                  </span>
                </TableCell>
                <TableCell className="font-tabular text-xs">{formatDate(emp.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<UsersRound className="w-full h-full" />}
          variant="neutral"
          title="No employees yet"
          description="Add waiters, chefs, and other staff to track service performance over time."
          action={canManageEmployees ? <AddEmployeeDialog /> : undefined}
        />
      )}
    </div>
  );
}
