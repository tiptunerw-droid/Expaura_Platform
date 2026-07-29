import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyRwf(n: number | bigint | string | null | undefined) {
  if (n === null || n === undefined) return "RWF 0";
  const num = typeof n === "bigint" ? Number(n) : Number(n);
  if (!isFinite(num)) return "RWF 0";
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(d: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(date);
}

export function formatDateTime(d: Date | string | null | undefined) {
  return formatDate(d, { hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(date);
}

export function isRestaurantOpen(hoursJson: unknown): { open: boolean; label: string } {
  const defaultLabel = "Hours not set";
  if (!hoursJson || typeof hoursJson !== "object") return { open: false, label: defaultLabel };
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  const key = days[today] as keyof typeof hoursJson;
  const todays = (hoursJson as Record<string, unknown>)[key];
  if (!todays || typeof todays !== "object") return { open: false, label: "Closed today" };
  const { open, close, closed } = todays as { open?: string; close?: string; closed?: boolean };
  if (closed || !open || !close) return { open: false, label: "Closed today" };
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const oMins = (oh ?? 0) * 60 + (om ?? 0);
  const cMins = (ch ?? 0) * 60 + (cm ?? 0);
  const isOpen = mins >= oMins && mins < cMins;
  return { open: isOpen, label: `${open} – ${close}` };
}

export function cxColorForRating(rating: number) {
  if (rating >= 4.4) return "herb";
  if (rating >= 3.6) return "brass";
  if (rating >= 2.6) return "ember";
  return "rose";
}
