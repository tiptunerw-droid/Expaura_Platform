import * as React from "react";
import { Building2, CreditCard, Star, AlertCircle, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { platformAnalytics } from "@/lib/actions/analytics";
import { formatCurrencyRwf } from "@/lib/utils";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverview() {
  let data;
  try {
    data = await platformAnalytics();
  } catch {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-ink-muted">Unauthorized. Admin access required.</p>
      </div>
    );
  }

  const {
    totalRestaurants,
    totalActiveSubscriptions,
    totalReviewsPlatform,
    totalComplaintsPlatform,
    revenueByMonth,
    topCities,
    topRatedRestaurants,
    mostComplainedRestaurants,
  } = data;

  const conversionRate = totalRestaurants > 0
    ? Math.round((totalActiveSubscriptions / totalRestaurants) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Restaurants</p>
              <p className="font-display text-xl text-ink">{totalRestaurants}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Active subs</p>
              <p className="font-display text-xl text-ink">{totalActiveSubscriptions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-brass shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Reviews</p>
              <p className="font-display text-xl text-ink">{totalReviewsPlatform}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Complaints</p>
              <p className="font-display text-xl text-ink">{totalComplaintsPlatform}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Conversion</p>
              <p className="font-display text-xl text-ink">{conversionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Top cities</CardTitle>
          </CardHeader>
          <CardContent>
            {topCities.length > 0 ? (
              <div className="space-y-2">
                {topCities.map((city) => (
                  <div key={city.cityName} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#d9465b" }} />
                      <span className="text-sm text-ink-soft">{city.cityName}</span>
                    </div>
                    <span className="font-tabular text-sm text-ink font-medium">{city.restaurants}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted py-4 text-center">No cities with restaurants yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Revenue (est.)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length > 0 ? (
              <div className="space-y-2">
                {revenueByMonth.map((m) => (
                  <div key={m.monthLabel} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-ink-soft">{m.monthLabel}</span>
                    <span className="font-tabular text-sm text-ink font-medium">
                      {formatCurrencyRwf(Number(m.amountEstimate))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted py-4 text-center">Revenue data pending.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Top rated restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            {topRatedRestaurants.length > 0 ? (
              <div className="space-y-2">
                {topRatedRestaurants.slice(0, 8).map((r, i) => (
                  <div key={`${r.name}-${i}`} className="flex items-center justify-between py-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-soft truncate">{r.name}</p>
                      <p className="text-[10px] text-ink-muted">{r.cityName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                      <span className="font-tabular text-sm text-ink font-medium">{r.avgRating}</span>
                      <span className="text-[10px] text-ink-muted">({r.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted py-4 text-center">No reviews yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Most complained-about</CardTitle>
          </CardHeader>
          <CardContent>
            {mostComplainedRestaurants.length > 0 ? (
              <div className="space-y-2">
                {mostComplainedRestaurants.slice(0, 8).map((r, i) => (
                  <div key={`${r.name}-${i}`} className="flex items-center justify-between py-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink-soft truncate">{r.name}</p>
                      <p className="text-[10px] text-ink-muted">{r.cityName}</p>
                    </div>
                    <Badge variant="dark" size="sm">{r.complaintCount}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted py-4 text-center">No complaints platform-wide.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
