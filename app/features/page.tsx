import type { Metadata } from "next";
import Link from "next/link";
import {
  QrCode,
  Star,
  MessageCircle,
  TrendingUp,
  Users,
  MapPin,
  Sparkles,
  Building2,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Features",
  description:
    "QR digital menus, guest reviews, complaint tracking, analytics, staff performance, and AI insights for Rwanda's best restaurants.",
};

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Digital Menus",
    description:
      "Turn every table into an interactive menu. Guests scan, browse, and explore in seconds — and you update dishes instantly without reprinting a single menu.",
  },
  {
    icon: Star,
    title: "Authentic Guest Reviews",
    description:
      "Verified feedback rated across food, service, atmosphere, and cleanliness — brought to life with the Satisfaction Aura so good work is always visible.",
  },
  {
    icon: MessageCircle,
    title: "Complaint Tracking",
    description:
      "Guests report issues with table and receipt numbers. Your team follows every case through to resolution — nothing slips through the cracks.",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description:
      "Track rating trends, review volume, complaint resolution time, peak hours, and recommendation rate on a live dashboard built for decisions.",
  },
  {
    icon: Users,
    title: "Staff & Waiter Performance",
    description:
      "Monitor employee and waiter performance across branches, so exceptional service gets recognized and weak spots get fixed.",
  },
  {
    icon: MapPin,
    title: "Public Directory & Pages",
    description:
      "Get discovered by diners across Kigali and Rwanda. Beautiful public pages with gallery, hours, contact, and open/closed status.",
  },
  {
    icon: Sparkles,
    title: "AI Review Summaries",
    description:
      "Instead of reading hundreds of reviews, receive clear, actionable summaries of what guests love — and what to improve.",
  },
  {
    icon: Building2,
    title: "Multi-Branch & Gallery",
    description:
      "Manage multiple branches and rich photo galleries from one dashboard, all under a single account.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-4">
            The Expaura Platform
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-primary leading-tight max-w-3xl">
            Everything your restaurant needs to impress guests.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-5 max-w-2xl">
            Digitize your menu, capture honest feedback, resolve complaints, and grow your
            reputation — all from one dashboard built for Rwandan hospitality.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 h-12 px-6 rounded text-sm font-bold bg-white text-black hover:bg-emerald-500 hover:text-white transition-all"
            >
              See pricing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center h-12 px-6 rounded text-sm font-bold border border-gray-700 text-text-primary hover:bg-gray-800 transition-colors"
            >
              List your restaurant
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-alt border border-border-subtle rounded-lg p-5 sm:p-6 hover:border-gray-700 transition-colors"
              >
                <feature.icon className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className="font-display text-lg text-text-primary leading-snug">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dark-section border-y border-[#fafaf8]/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-[#fafaf8]">
              Start free for one month.
            </h2>
            <p className="text-sm sm:text-base text-[#9e9e9e] mt-3 max-w-xl mx-auto">
              Test every feature with no risk. When you&apos;re ready, go monthly at a flat rate that
              includes everything.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 h-12 px-8 rounded text-sm font-bold bg-white text-black hover:bg-emerald-500 hover:text-white transition-all mt-8"
            >
              Choose a plan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
