import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { TrendingUp, Star, AlertCircle } from "lucide-react";
import { SatisfactionAura } from "@/components/signature/SatisfactionAura";
import { getManagerRestaurant } from "@/lib/actions/restaurants";
import { getManagerPlanFeatures } from "@/lib/actions/restaurants";
import { getRestaurantReviewsStats } from "@/lib/actions/reviews";
import { ratingTrendByPeriod, complaintsByCategory, peakHours } from "@/lib/actions/analytics";
import { summarizeReviews } from "@/lib/actions/ai";
import { FeatureLock } from "@/components/dashboard/feature-lock";

/* ---------- Skeleton fallbacks ---------- */

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border-subtle p-6 h-[160px] animate-pulse">
          <div className="h-4 bg-surface-alt rounded w-1/2 mb-4" />
          <div className="h-8 bg-surface-alt rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-surface border border-border-subtle p-6 animate-pulse">
      <div className="h-4 bg-surface-alt rounded w-1/3 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-surface-alt rounded w-full" />
        ))}
      </div>
    </div>
  );
}

function MatrixSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border-subtle p-6 h-[240px] animate-pulse">
          <div className="h-4 bg-surface-alt rounded w-1/4 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-3 bg-surface-alt rounded w-3/4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AiSkeleton() {
  return (
    <div className="bg-surface-alt border border-border-subtle p-6 h-[180px] animate-pulse">
      <div className="h-4 bg-surface-alt rounded w-1/3 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-3 bg-surface-alt rounded w-full" />
        ))}
      </div>
    </div>
  );
}

/* ---------- Async section components ---------- */

async function StatCards({ rid }: { rid: string }) {
  const [stats, comps, hrs] = await Promise.all([
    getRestaurantReviewsStats(rid),
    complaintsByCategory(rid, 30),
    peakHours(rid, 30),
  ]);

  const peakHourEntry = hrs[0];
  const peakHourLabel = peakHourEntry
    ? `${peakHourEntry.hour.toString().padStart(2, "0")}:00`
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors">
        <div className="mb-8">
          <SatisfactionAura rating={stats.averageOverall || null} size={56} showLabel={false} />
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Satisfaction Score</p>
          <p className="text-4xl font-black text-text-primary mt-1">
            {stats.averageOverall > 0 ? stats.averageOverall.toFixed(1) : "—"}
            <span className="text-lg text-text-tertiary">/5</span>
          </p>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-2">{stats.totalReviews} TOTAL REVIEWS</p>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors">
        <div className="mb-8"><Star className="w-8 h-8 text-text-tertiary" /></div>
        <div>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Recommendation Rate</p>
          <p className="text-4xl font-black text-text-primary mt-1">{stats.recommendRate}%</p>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-2">WOULD RECOMMEND</p>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors">
        <div className="mb-8"><AlertCircle className="w-8 h-8 text-text-tertiary" /></div>
        <div>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Complaints (30d)</p>
          <p className="text-4xl font-black text-text-primary mt-1">{comps.reduce((s, c) => s + c.count, 0)}</p>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-2">IN {comps.length} CATEGORIES</p>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors">
        <div className="mb-8"><TrendingUp className="w-8 h-8 text-text-tertiary" /></div>
        <div>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Peak Hour</p>
          <p className="text-4xl font-black text-text-primary mt-1">{peakHourLabel}</p>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-2">
            {peakHourEntry ? `${peakHourEntry.count} REVIEWS LOGGED` : "NO DATA"}
          </p>
        </div>
      </div>
    </div>
  );
}

async function TrendChart({ rid }: { rid: string }) {
  const trend7 = await ratingTrendByPeriod(rid, "7d");

  return (
    <div className="bg-surface border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
        <h3 className="text-xl font-black uppercase tracking-tighter text-text-primary">7-Day Trajectory</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Trailing Metrics</span>
      </div>
      {trend7.length > 0 ? (
        <div className="space-y-4">
          {trend7.map((day) => (
            <div key={day.periodLabel} className="flex items-center gap-4">
              <span className="text-xs text-text-tertiary w-16 shrink-0 font-bold tracking-widest uppercase">{day.periodLabel.slice(5)}</span>
              <div className="flex-1 h-2 bg-surface-alt overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${(day.avgOverall / 5) * 100}%`, backgroundColor: day.avgOverall >= 4 ? "#10b981" : day.avgOverall >= 3 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <span className="text-xs font-black text-text-primary w-8 text-right">{day.avgOverall > 0 ? day.avgOverall.toFixed(1) : "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest py-8 text-center border border-dashed border-border-subtle">INSUFFICIENT DATA SET</p>
      )}
    </div>
  );
}

async function BreakdownMatrix({ rid }: { rid: string }) {
  const [stats, comps] = await Promise.all([
    getRestaurantReviewsStats(rid),
    complaintsByCategory(rid, 30),
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-surface border border-border-subtle p-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-text-tertiary">Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Food Quality", value: stats.averageFood },
            { label: "Service", value: stats.averageService },
            { label: "Atmosphere", value: stats.averageAtmosphere },
            { label: "Cleanliness", value: stats.averageCleanliness },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between group">
              <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary group-hover:text-text-primary transition-colors">{item.label}</span>
              <span className="flex items-center gap-2">
                <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span className="font-black text-sm text-text-primary">{item.value > 0 ? item.value.toFixed(1) : "—"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface border border-border-subtle p-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-text-tertiary">Incident Matrix</h3>
        {comps.length > 0 ? (
          <div className="space-y-4">
            {comps.slice(0, 5).map((cat) => (
              <div key={cat.categoryName} className="flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary group-hover:text-text-primary transition-colors">{cat.categoryName}</span>
                <span className="font-black text-sm text-red-500 bg-red-500/10 px-2 py-0.5">{cat.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest py-4 text-center border border-dashed border-border-subtle">NO ACTIVE ALERTS</p>
        )}
      </div>
    </div>
  );
}

async function AiTelemetry({ rid }: { rid: string }) {
  const aiSummary = await summarizeReviews(rid, 30).catch(() => ({
    summary: "AI insights unavailable.",
    highlights: [],
    painPoints: [],
  }));

  return (
    <div className="bg-surface-alt border border-border-subtle p-6">
      <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-emerald-400 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
        AI Telemetry
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed font-medium">{aiSummary.summary}</p>
    </div>
  );
}

async function RatingDistribution({ rid }: { rid: string }) {
  const stats = await getRestaurantReviewsStats(rid);

  return (
    <div className="bg-surface border border-border-subtle p-6">
      <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-text-tertiary">Distribution (30d)</h3>
      {stats.totalReviews > 0 ? (
        <div className="flex justify-between items-end h-32 gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.reviewsByStar[star] || 0;
            const max = Math.max(...Object.values(stats.reviewsByStar), 1);
            return (
              <div key={star} className="flex flex-col items-center gap-2 flex-1 group">
                <span className="text-[10px] font-black text-text-tertiary group-hover:text-text-primary transition-colors">{count}</span>
                <div className="w-full transition-all group-hover:opacity-80" style={{ height: `${Math.max(4, (count / max) * 100)}px`, backgroundColor: star >= 4 ? "#10b981" : star >= 3 ? "#f59e0b" : "#ef4444" }} />
                <span className="text-[10px] font-bold text-text-tertiary">S{star}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest py-8 text-center border border-dashed border-border-subtle">AWAITING METRICS</p>
      )}
    </div>
  );
}

/* ---------- Main page component ---------- */

export default async function AnalyticsDashboard() {
  let restaurant;
  try {
    restaurant = await getManagerRestaurant();
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border-subtle">
        <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-text-primary mb-2">System Uninitialized</h2>
        <p className="text-text-tertiary text-sm max-w-md font-bold uppercase tracking-widest">
          Register your restaurant core to begin telemetry.
        </p>
      </div>
    );
  }

  const rid = restaurant.id;
  const features = await getManagerPlanFeatures();
  const planName = features.planName;

  if (!features.analyticsEnabled) {
    return (
      <FeatureLock
        title="Analytics"
        description="Detailed satisfaction, trend and incident analytics are included in the Standard and Premium plans. Upgrade to unlock."
      />
    );
  }

  return (
    <div className="space-y-8 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          {planName} TIER
        </span>
        {restaurant.name && (
          <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
            {/* {restaurant.name} */}
          </span>
        )}
      </div>

      <Suspense fallback={<StatSkeleton />}>
        <StatCards rid={rid} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ChartSkeleton />}>
            <TrendChart rid={rid} />
          </Suspense>
          <Suspense fallback={<MatrixSkeleton />}>
            <BreakdownMatrix rid={rid} />
          </Suspense>
        </div>
        <div className="space-y-6">
          {features.aiSummaryEnabled ? (
            <Suspense fallback={<AiSkeleton />}>
              <AiTelemetry rid={rid} />
            </Suspense>
          ) : (
            <div className="bg-surface-alt border border-border-subtle p-6 text-center">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-text-tertiary">
                AI Telemetry
              </h3>
              <p className="text-xs text-text-tertiary mb-4">
                AI summaries of guest feedback are not included in your plan.
              </p>
              <Link
                href="/dashboard/profile#subscription"
                className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Upgrade to unlock
              </Link>
            </div>
          )}
          <Suspense fallback={<MatrixSkeleton />}>
            <RatingDistribution rid={rid} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
