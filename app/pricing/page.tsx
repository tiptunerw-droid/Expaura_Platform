"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  Phone,
  Mail,
  Send,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

const WHATSAPP_NUMBER = "250792548195";
const PHONE_DISPLAY = "+250 792 548 195";
const PHONE_RAW = "+250792548195";
const EMAIL = "caleblevyb@gmail.com";

type PlanId = "trial" | "monthly";

const PLANS: {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  amount: string;
  highlight?: string;
}[] = [
  {
    id: "monthly",
    name: "Monthly",
    tagline: "Everything included, flat rate.",
    price: "20,000",
    amount: "20000",
    highlight: "Most popular",
  },
  {
    id: "trial",
    name: "Test Free",
    tagline: "Try all features for one month.",
    price: "0",
    amount: "0",
  },
];

const INCLUDED_FEATURES = [
  "QR digital menu",
  "Unlimited guest reviews",
  "Complaint tracking with table & receipt numbers",
  "Analytics dashboard",
  "AI review summaries",
  "Staff & waiter performance",
  "Public directory & restaurant page",
  "Multi-branch & photo gallery",
  "WhatsApp & phone support",
];

function ussdCode(amount: string) {
  return `*182*1*1*0792548195*${amount}#`;
}

export default function PricingPage() {
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [copied, setCopied] = useState(false);

  const activePlan = PLANS.find((p) => p.id === selected) ?? null;
  const code = activePlan ? ussdCode(activePlan.amount) : "";

  const whatsappMessage = activePlan
    ? `Hello Expaura, I want to subscribe to the ${activePlan.name} plan (${activePlan.price} RWF/month). My payment screenshot is below. Please activate my subscription, the name of the restaurant is .`
    : "";

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const choosePlan = (id: PlanId) => {
    setSelected(id);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <SiteHeader />
      <main className="pt-24 flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-4">
            Pricing
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-primary leading-tight max-w-3xl">
            One price. Every feature.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-5 max-w-2xl">
            No tiers, no hidden fees. Pay by mobile money with a simple code, and we activate
            your account after you confirm on WhatsApp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 max-w-4xl">
            {PLANS.map((plan) => {
              const isActive = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => choosePlan(plan.id)}
                  className={`text-left rounded-lg border p-6 sm:p-8 transition-colors ${
                    isActive
                      ? "border-emerald-500 bg-surface-alt"
                      : "border-border-subtle bg-surface-alt hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      {plan.tagline}
                    </span>
                    {plan.highlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <BadgeCheck className="w-3 h-3" /> {plan.highlight}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-text-primary">
                      RWF {plan.price}
                    </span>
                    <span className="text-sm text-gray-500">/ month</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {plan.id === "monthly"
                      ? "Full access, cancel anytime."
                      : "Free for one month. No payment needed."}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center w-full h-11 mt-6 rounded text-sm font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-black hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {isActive ? "Selected" : "Choose plan"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-w-4xl mt-8 bg-surface-alt border border-border-subtle rounded-lg p-6 sm:p-8">
            <h2 className="font-display text-xl text-text-primary">Every plan includes</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
              {INCLUDED_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {activePlan && (
          <section className="border-y border-border-subtle bg-surface-alt/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-3">
                Step 1 — Pay with mobile money
              </p>
              <h2 className="font-display text-2xl sm:text-3xl text-text-primary">
                Dial this code to pay RWF {activePlan.price}
              </h2>

              <div className="mt-6 bg-black border border-gray-800 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <code className="font-mono text-lg sm:text-2xl text-emerald-400 break-all">
                  {code}
                </code>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded text-sm font-bold bg-white text-black hover:bg-emerald-500 hover:text-white transition-colors shrink-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy code"}
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                {activePlan.id === "trial"
                  ? "Your trial month is free — no payment is required. Send a WhatsApp message below and we&apos;ll activate your account right away."
                  : "Dial the code above from your phone to complete the mobile money payment. Then confirm on WhatsApp and we activate your subscription."}
              </p>

              <div className="mt-8 border-t border-border-subtle pt-8">
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-3">
                  Step 2 — Confirm on WhatsApp
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded text-sm font-bold bg-[#25D366] text-black hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" /> Send message on WhatsApp
                </a>
                <p className="text-sm text-gray-400 mt-3">
                  Send your payment screenshot to{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    {PHONE_DISPLAY}
                  </a>{" "}
                  and we&apos;ll activate your plan.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-2xl text-text-primary">Questions? Contact us</h2>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-alt px-5 py-4 text-sm text-text-primary hover:border-gray-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-alt px-5 py-4 text-sm text-text-primary hover:border-gray-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              {EMAIL}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-alt px-5 py-4 text-sm text-text-primary hover:border-gray-600 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              WhatsApp {PHONE_DISPLAY}
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Not sure which option is right for you?{" "}
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">
              Explore the features
            </Link>{" "}
            or{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
              start registration
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
