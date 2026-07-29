import * as React from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Minus, Star, AlertCircle, ThumbsUp,
  Search, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { listEmployees } from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";

export default async function WaitersPage() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const rid = restaurant.id;
  const plan = restaurant.currentSubscription?.plan;

  if (!plan?.employeeTrackingEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-brass-soft flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-brass" />
        </div>
        <h2 className="font-display text-2xl text-ink mb-2">Employee tracking</h2>
        <p className="text-ink-muted text-sm max-w-md mb-6">
          Waiter performance tracking helps identify training opportunities and
          celebrate top performers. Upgrade to Premium to unlock.
        </p>
        <Link href="/dashboard/profile#subscription">
          <Button variant="brass">View plans</Button>
        </Link>
      </div>
    );
  }

  const employees = await listEmployees(rid).catch(() => []);
  const totalComplaints = employees.reduce((s, e) => s + e.pendingComplaints, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-herb-soft/40 rounded-lg border border-herb/20">
        <div className="w-10 h-10 rounded-full bg-herb-soft flex items-center justify-center shrink-0">
          <ThumbsUp className="w-5 h-5 text-herb" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Tracking performance to help staff grow</p>
          <p className="text-xs text-ink-muted mt-0.5">
            This data identifies training opportunities, not fault. Use it to coach and celebrate.
          </p>
        </div>
      </div>

      {employees.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-ink-muted shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">Staff tracked</p>
                  <p className="font-display text-xl text-ink">{employees.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-ink-muted shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">Open complaints</p>
                  <p className="font-display text-xl text-ink">{totalComplaints}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="w-5 h-5 text-brass shrink-0" />
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">Top performer</p>
                  <p className="font-display text-xl text-ink truncate">
                    {employees.reduce((best, e) => e.pendingComplaints < best.pendingComplaints ? e : best, employees[0]).name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">Staff overview</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
                  <Input placeholder="Search staff…" className="pl-8 h-8 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-ceramic-deep/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-ceramic-deep flex items-center justify-center shrink-0">
                        <span className="font-display text-sm text-ink-muted">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{emp.name}</p>
                        <p className="text-[10px] text-ink-muted">
                          {emp.jobTitle || "Staff"} · joined{" "}
                          {new Date(emp.createdAt).toLocaleDateString("en-RW", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-ink-muted">Complaints</p>
                        <p className={`font-tabular text-sm font-medium ${
                          emp.pendingComplaints === 0 ? "text-herb" : emp.pendingComplaints <= 2 ? "text-brass" : "text-ember"
                        }`}>
                          {emp.pendingComplaints}
                        </p>
                      </div>
                      <div className="w-1 h-8 bg-line rounded-full" />
                      <div className="text-right min-w-[60px]">
                        <p className="text-xs text-ink-muted">Status</p>
                        <Badge
                          variant={emp.isActive ? "herb" : "default"}
                          size="sm"
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<Users className="w-full h-full" />}
          variant="neutral"
          title="No staff yet"
          description="Add employees to start tracking service performance and identifying training opportunities."
          action={
            <Link href="/dashboard/employees">
              <Button variant="primary" size="sm">Add employees</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
