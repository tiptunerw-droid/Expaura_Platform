import { headers } from "next/headers";
import { errors } from "@/lib/errors";

const STORE = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

function prune(key: string, windowMs: number, now: number): void {
  const timestamps = STORE.get(key);
  if (!timestamps) return;
  while (timestamps.length > 0 && now - timestamps[0] >= windowMs) {
    timestamps.shift();
  }
  if (timestamps.length === 0) STORE.delete(key);
}

function record(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(key, windowMs, now);
  if (STORE.size >= MAX_KEYS && !STORE.has(key)) {
    const first = STORE.keys().next().value as string | undefined;
    if (first !== undefined) STORE.delete(first);
  }
  const timestamps = STORE.get(key) ?? [];
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  STORE.set(key, timestamps);
  return true;
}

export interface RateLimitOptions {
  scope: string;
  limit: number;
  windowMs: number;
  key?: string;
}

export async function enforceRateLimit({
  scope,
  limit,
  windowMs,
  key,
}: RateLimitOptions): Promise<void> {
  const identity = key ?? (await getClientIp());
  const allowed = record(`${scope}:${identity}`, limit, windowMs);
  if (!allowed) throw errors.rateLimited();
}

export async function enforceContentAnomaly({
  scope,
  limit,
  windowMs,
  fingerprint,
}: Omit<RateLimitOptions, "key"> & { fingerprint: string }): Promise<void> {
  await enforceRateLimit({
    scope: `${scope}:content`,
    limit,
    windowMs,
    key: fingerprint,
  });
}
