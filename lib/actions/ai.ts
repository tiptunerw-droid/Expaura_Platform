"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const POSITIVE_KEYWORDS = [
  "delicious",
  "great",
  "amazing",
  "excellent",
  "wonderful",
  "friendly",
  "fast",
  "clean",
  "fresh",
  "tasty",
  "yummy",
  "love",
  "best",
  "perfect",
  "recommend",
  "beautiful",
  "nice",
  "good",
  "fantastic",
  "superb",
  "brochette",
  "isombe",
  "ugali",
  "mtori",
  "platter",
  "fish",
  "service",
  "atmosphere",
  "staff",
  "ambiance",
];

const NEGATIVE_KEYWORDS = [
  "slow",
  "bad",
  "terrible",
  "horrible",
  "dirty",
  "rude",
  "cold",
  "late",
  "wait",
  "waiting",
  "expensive",
  "small",
  "disappointing",
  "noisy",
  "salty",
  "bland",
  "unclean",
  "unfriendly",
  "poor",
  "awful",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function countKeywordMatches(comment: string, keywords: string[]): string[] {
  const tokens = new Set(tokenize(comment));
  const words = new Set<string>();
  for (const kw of keywords) {
    const kwTokens = kw.toLowerCase().split(/\s+/);
    if (kwTokens.every((t) => tokens.has(t))) {
      words.add(kw);
    }
  }
  return [...words];
}

function topFrequent(strings: string[], n: number): string[] {
  const count: Record<string, number> = {};
  for (const s of strings) {
    count[s] = (count[s] || 0) + 1;
  }
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([s]) => s);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function summarizeReviews(restaurantId: string, lastNDays: number = 30) {
  const ridValid = z.string().uuid().safeParse(restaurantId);
  if (!ridValid.success) throw new Error("Invalid restaurant ID");
  const daysValid = z.number().int().min(1).max(3650).default(30).safeParse(lastNDays);
  if (!daysValid.success) throw new Error("Invalid lastNDays");

  const since = new Date(Date.now() - daysValid.data * 24 * 60 * 60 * 1000);

  const reviews = await prisma.review.findMany({
    where: {
      restaurantId: ridValid.data,
      createdAt: { gte: since },
    },
    select: {
      overallRating: true,
      comment: true,
      wouldRecommend: true,
      createdAt: true,
    },
  });

  if (reviews.length === 0) {
    return {
      summary: `No reviews collected in the last ${daysValid.data} days.`,
      highlights: [],
      painPoints: [],
    };
  }

  const comments = reviews
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .map((r) => r.comment!.trim());

  const positiveReviews = reviews.filter((r) => r.overallRating >= 4);
  const negativeReviews = reviews.filter((r) => r.overallRating <= 3);

  const avgOverall =
    Math.round((reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length) * 10) / 10;

  const recommendVals = reviews.filter((r) => r.wouldRecommend !== undefined);
  const recommendRate = recommendVals.length
    ? Math.round((recommendVals.filter((r) => r.wouldRecommend).length / recommendVals.length) * 100)
    : null;

  const positiveComments = positiveReviews
    .filter((r) => r.comment)
    .map((r) => r.comment!);
  const negativeComments = negativeReviews
    .filter((r) => r.comment)
    .map((r) => r.comment!);

  const allPositiveHits: string[] = [];
  for (const c of positiveComments) allPositiveHits.push(...countKeywordMatches(c, POSITIVE_KEYWORDS));
  const highlights = topFrequent(allPositiveHits, 3).map(capitalize);

  const allNegativeHits: string[] = [];
  for (const c of negativeComments) allNegativeHits.push(...countKeywordMatches(c, NEGATIVE_KEYWORDS));
  const painPoints = topFrequent(allNegativeHits, 3).map(capitalize);

  const negativePct = comments.length
    ? Math.round((negativeComments.length / comments.length) * 100)
    : 0;

  let summary = `Based on ${reviews.length} review${reviews.length === 1 ? "" : "s"} (avg ${avgOverall}/5)`;
  if (recommendRate !== null) summary += `, ${recommendRate}% would recommend`;
  summary += ".";

  if (highlights.length > 0) {
    summary += ` Guests praise ${highlights.slice(0, 2).join(", ")}`;
    if (highlights.length > 2) summary += ` and ${highlights[2]}`;
    summary += ".";
  }

  if (painPoints.length > 0 && negativePct >= 15) {
    summary += ` However, ${negativePct}% mention ${painPoints.slice(0, 2).join(", ")}`;
    if (painPoints.length > 2) summary += ` or ${painPoints[2]}`;
    summary += " as areas to improve.";
  } else if (negativeReviews.length > 0) {
    summary += ` Some guests (${negativePct}%) had less positive experiences.`;
  }

  return {
    summary,
    highlights,
    painPoints,
  };
}
