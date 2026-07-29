import * as React from "react";
import { TrendingUp, TrendingDown, Star, MessageSquare, AlertCircle, ThumbsUp, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SatisfactionAura } from "@/components/signature/SatisfactionAura";
import { AiSummaryWidget } from "@/components/dashboard/ai-summary-widget";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getRestaurantReviewsStats } from "@/lib/actions/reviews";
import { ratingTrendByPeriod, complaintsByCategory, peakHours } from "@/lib/actions/analytics";
import { summarizeReviews } from "@/lib/actions/ai";
import { formatCurrencyRwf } from "@/lib/utils";

async function AnalyticsDashboard() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-ceramic-deep flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-ink-muted" />
        </div>
        <h2 className="font-display text-2xl text-ink mb-2">No restaurant found</h2>
        <p className="text-ink-muted text-sm max-w-md">
          Set up your restaurant profile to start seeing analytics.
        </p>
      </div>
    );
  }

  const rid = restaurant.id;
  const [stats, trend7, trend30, complaintsCat, peakHrs, aiSummary] = await Promise.all([
    getRestaurantReviewsStats(rid),
    ratingTrendByPeriod(rid, "7d"),
    ratingTrendByPeriod(rid, "30d"),
    complaintsByCategory(rid, 30),
    peakHours(rid, 30),
    summarizeReviews(rid, 30).catch(() => ({
      summary: "AI insights unavailable right now.",
      highlights: [],
      painPoints: [],
    })),
  ]);

  const currentSub = restaurant.currentSubscription;
  const planName = currentSub?.plan?.name || "Free";

  const trendDirection =
    trend7.length >= 2 && trend7[trend7.length - 1].avgOverall > trend7[0].avgOverall
      ? "up"
      : trend7.length >= 2 && trend7[trend7.length - 1].avgOverall < trend7[0].avgOverall
        ? "down"
        : "flat";

  const peakHourEntry = peakHrs[0];
  const peakHourLabel = peakHourEntry
    ? `${peakHourEntry.hour.toString().padStart(2, "0")}:00`
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="dark" size="sm">
          {planName}
        </Badge>
        {restaurant.name && (
          <span className="text-sm text-ink-muted">{restaurant.name}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SatisfactionAura
                rating={stats.averageOverall || null}
                size={72}
                showLabel={false}
              />
              <Badge variant={trendDirection === "up" ? "dark" : trendDirection === "down" ? "outline" : "default"} size="sm">
                {trendDirection === "up" ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : trendDirection === "down" ? (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                ) : null}
                {trendDirection === "up" ? "Rising" : trendDirection === "down" ? "Falling" : "Stable"}
              </Badge>
            </div>
            <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Satisfaction</p>
            <p className="font-display text-xl text-ink mt-0.5">
              {stats.averageOverall > 0 ? stats.averageOverall.toFixed(1) : "—"}
              <span className="text-sm text-ink-muted font-sans font-normal"> / 5</span>
            </p>
            <p className="text-xs text-ink-muted mt-1">{stats.totalReviews} total reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Recommendation rate</p>
            <p className="font-display text-xl text-ink mt-0.5">
              {stats.recommendRate}%
            </p>
            <p className="text-xs text-ink-muted mt-1">would recommend to a friend</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Complaints (30d)</p>
            <p className="font-display text-xl text-ink mt-0.5">
              {complaintsCat.reduce((s, c) => s + c.count, 0)}
            </p>
            <p className="text-xs text-ink-muted mt-1">across {complaintsCat.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Peak review hour</p>
            <p className="font-display text-xl text-ink mt-0.5">{peakHourLabel}</p>
            <p className="text-xs text-ink-muted mt-1">
              {peakHourEntry ? `${peakHourEntry.count} reviews at this hour` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">Rating trend (7 days)</CardTitle>
                <Badge variant="outline" size="sm">Last 7 days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {trend7.length > 0 ? (
                <div className="space-y-2">
                  {trend7.map((day) => (
                    <div key={day.periodLabel} className="flex items-center gap-3">
                      <span className="text-xs text-ink-muted w-24 shrink-0 font-tabular">
                        {day.periodLabel.slice(5)}
                      </span>
                      <div className="flex-1 h-6 bg-ceramic-deep rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(day.avgOverall / 5) * 100}%`,
                            backgroundColor: day.avgOverall >= 4 ? "var(--herb)" : day.avgOverall >= 3 ? "var(--brass)" : "var(--ember)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-tabular text-ink-soft w-8 text-right">
                        {day.avgOverall > 0 ? day.avgOverall.toFixed(1) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted py-4 text-center">No reviews in the last 7 days.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Ratings breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Food", value: stats.averageFood },
                  { label: "Service", value: stats.averageService },
                  { label: "Atmosphere", value: stats.averageAtmosphere },
                  { label: "Cleanliness", value: stats.averageCleanliness },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">{item.label}</span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                      <span className="font-tabular text-sm font-medium text-ink">
                        {item.value > 0 ? item.value.toFixed(1) : "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Complaints by category</CardTitle>
              </CardHeader>
              <CardContent>
                {complaintsCat.length > 0 ? (
                  <div className="space-y-2.5">
                    {complaintsCat.slice(0, 5).map((cat) => (
                      <div key={cat.categoryName} className="flex items-center justify-between">
                        <span className="text-sm text-ink-soft">{cat.categoryName}</span>
                        <span className="font-tabular text-sm text-ink font-medium">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted py-4 text-center">No complaints this period.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <AiSummaryWidget
            summary={aiSummary.summary}
            highlights={aiSummary.highlights}
            painPoints={aiSummary.painPoints}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Reviews (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalReviews > 0 ? (
                <div className="grid grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.reviewsByStar[star] || 0;
                    const max = Math.max(...Object.values(stats.reviewsByStar), 1);
                    return (
                      <div key={star} className="flex flex-col items-center gap-1.5">
                        <span className="font-tabular text-xs text-ink-muted">{count}</span>
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: `${Math.max(4, (count / max) * 48)}px`,
                            backgroundColor: star >= 4 ? "var(--herb)" : star >= 3 ? "var(--brass)" : "var(--ember)",
                          }}
                        />
                        <span className="text-[10px] text-ink-muted">{star}★</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink-muted py-4 text-center">No reviews this period.</p>
              )}
            </CardContent>
          </Card>

          {restaurant.currentSubscription?.plan?.analyticsEnabled && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Popular items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-muted">
                  Top menu items by review mentions. Unlock detailed item tracking on Premium.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
