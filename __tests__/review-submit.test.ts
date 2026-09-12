import { describe, it, expect, beforeEach, vi } from "vitest";

const REST = "00000000-0000-4000-8000-000000000001";
const GOOD_REVIEW = {
  restaurantId: REST,
  overallRating: 5,
  foodRating: 5,
  serviceRating: 4,
  comment: "Delicious isombe and great service",
  tableNumber: "7",
};

const mocks = vi.hoisted(() => ({
  prisma: {
    restaurant: { findUnique: vi.fn() },
    $transaction: vi.fn(),
    tx: {
      review: { create: vi.fn() },
      complaintCategory: { findFirst: vi.fn() },
      complaint: { create: vi.fn() },
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/generated/prisma/client", () => ({
  ComplaintStatus: { PENDING: "PENDING" },
}));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
  enforceContentAnomaly: vi.fn(),
}));
vi.mock("@/lib/actions/notifications", () => ({ createNotification: vi.fn() }));

import { submitReview } from "@/lib/actions/reviews";
import { createNotification } from "@/lib/actions/notifications";
import { errors } from "@/lib/errors";

describe("submitReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.restaurant.findUnique.mockResolvedValue({ id: REST, isActive: true });
    mocks.prisma.$transaction.mockImplementation(
      (cb: (tx: typeof mocks.prisma.tx) => Promise<unknown>) => cb(mocks.prisma.tx),
    );
    mocks.prisma.tx.review.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: "review-1", ...data }),
    );
    mocks.prisma.tx.complaintCategory.findFirst.mockResolvedValue({ id: "cat-1", name: "Service" });
    mocks.prisma.tx.complaint.create.mockImplementation((
      { data }: { data: Record<string, unknown> },
    ) => Promise.resolve({ id: "complaint-1", ...data }));
    createNotification.mockResolvedValue(undefined);
  });

  it("records a good review without auto-creating a complaint", async () => {
    const result = await submitReview(GOOD_REVIEW);

    expect(result).toEqual({ reviewId: "review-1", complaintId: undefined });
    expect(mocks.prisma.tx.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ overallRating: 5, tableNumber: "7" }),
    });
    expect(mocks.prisma.tx.complaintCategory.findFirst).not.toHaveBeenCalled();
    expect(mocks.prisma.tx.complaint.create).not.toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledTimes(1);
  });

  it("auto-flags a low rating as a complaint carrying the table number & receipt info", async () => {
    const result = await submitReview({
      ...GOOD_REVIEW,
      overallRating: 1,
      serviceRating: 1,
      foodRating: 2,
      comment: "cold food and rude waiter",
    });

    expect(result).toEqual({ reviewId: "review-1", complaintId: "complaint-1" });
    expect(mocks.prisma.tx.complaint.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reviewId: "review-1",
        categoryId: "cat-1",
        description: "cold food and rude waiter",
        tableNumber: "7",
        status: "PENDING",
      }),
    });
    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(createNotification).toHaveBeenCalledWith(
      REST,
      "NEW_REVIEW",
      "New Review Submitted",
      expect.any(String),
      "/dashboard/reviews",
    );
  });

  it("rejects an invalid payload before touching the database", async () => {
    await expect(
      submitReview({ restaurantId: REST, overallRating: 9 }),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    expect(mocks.prisma.restaurant.findUnique).not.toHaveBeenCalled();
    expect(mocks.prisma.tx.review.create).not.toHaveBeenCalled();
  });

  it("rejects reviews for an unknown restaurant", async () => {
    mocks.prisma.restaurant.findUnique.mockResolvedValue(null);

    await expect(submitReview(GOOD_REVIEW)).rejects.toBeInstanceOf(errors.notFound("x").constructor);

    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});