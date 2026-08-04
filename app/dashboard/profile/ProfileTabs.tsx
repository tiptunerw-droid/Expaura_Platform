"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrencyRwf, formatDate } from "@/lib/utils";
import { ProfileForm } from "./ProfileForm";
import { QrDisplay } from "./QrDownload";

interface SubPlan {
  name: string;
  priceMonthly: { toString(): string };
  maxBranches: number;
  maxStaff: number;
  analyticsEnabled: boolean;
  aiSummaryEnabled: boolean;
  complaintsEnabled: boolean;
  employeeTrackingEnabled: boolean;
}

interface SubData {
  status: string;
  periodStart: Date;
  periodEnd: Date;
  plan: SubPlan;
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: unknown;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  city?: { name: string } | null;
  qrCodes?: { id: string; code: string; branchId?: string | null }[];
  currentSubscription?: SubData | null;
}

interface Props {
  restaurant: RestaurantData;
  canManageSettings: boolean;
  canManageQr: boolean;
}

export function ProfileTabs({ restaurant, canManageSettings, canManageQr }: Props) {
  const [tab, setTab] = React.useState("profile");
  const sub = restaurant.currentSubscription;
  const plan = sub?.plan;

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="qr">QR Code</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg text-ink">Restaurant profile</CardTitle>
            <CardDescription>
              This information appears on your public page and QR menu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManageSettings ? (
              <ProfileForm restaurant={restaurant} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-ink-muted text-xs">Restaurant name</p>
                  <p className="font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <p className="text-ink-muted text-xs">City</p>
                  <p className="font-medium">{restaurant.city?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-ink-muted text-xs">Phone</p>
                  <p className="font-medium">{restaurant.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-ink-muted text-xs">Address</p>
                  <p className="font-medium">{restaurant.address || "—"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg text-ink">Subscription</CardTitle>
            <CardDescription>
              Current plan and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {plan ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg border border-line">
                  <div>
                    <Badge
                      variant={plan.name === "Premium" ? "brass" : plan.name === "Standard" ? "herb" : "default"}
                      size="sm"
                    >
                      {plan.name}
                    </Badge>
                    <p className="text-sm text-ink mt-2 font-medium">
                      {formatCurrencyRwf(Number(plan.priceMonthly))}/month
                    </p>
                  </div>
                  <Badge
                    variant={sub.status === "ACTIVE" ? "herb" : sub.status === "EXPIRED" ? "rose" : "default"}
                    size="sm"
                  >
                    {sub.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-ink-muted text-xs">Period start</p>
                    <p className="font-medium">{formatDate(sub.periodStart)}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">Period end</p>
                    <p className="font-medium">{formatDate(sub.periodEnd)}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">Max branches</p>
                    <p className="font-medium">{plan.maxBranches}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">Max staff</p>
                    <p className="font-medium">{plan.maxStaff}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Features</p>
                  {[
                    { label: "Analytics", enabled: plan.analyticsEnabled },
                    { label: "AI summaries", enabled: plan.aiSummaryEnabled },
                    { label: "Complaint management", enabled: plan.complaintsEnabled },
                    { label: "Employee tracking", enabled: plan.employeeTrackingEnabled },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="text-ink-soft">{f.label}</span>
                      <Badge variant={f.enabled ? "herb" : "default"} size="sm">
                        {f.enabled ? "Included" : "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-ink-muted mb-4">No active subscription.</p>
                <Link href="/dashboard/profile#subscription">
                  <Button variant="brass">View plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="qr">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg text-ink">QR Code</CardTitle>
            <CardDescription>
              Customers scan this to view your menu and leave reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <QrDisplay qrCodes={restaurant.qrCodes ?? []} slug={restaurant.slug} canGenerate={canManageQr} />
            <p className="text-xs text-ink-muted">
              Print this QR and place it on tables. Customers scan with their phone camera.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
