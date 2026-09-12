import { describe, it, expect, beforeEach, vi } from "vitest";

const REST = "00000000-0000-4000-8000-000000000001";

const mocks = vi.hoisted(() => ({
  prisma: {
    restaurant: { findUnique: vi.fn() },
  },
  session: { getSession: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
  withDbRetry: vi.fn((fn: () => unknown) => fn()),
}));
vi.mock("@/lib/auth/session", () => ({ getSession: mocks.session.getSession }));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
  enforceContentAnomaly: vi.fn(),
}));

describe("getManagerPlanFeatures (plan gate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("defaults to a fully-enabled Trial when there is no subscription", async () => {
    mocks.prisma.restaurant.findUnique.mockResolvedValue({ subscriptions: [] });
    mocks.session.getSession.mockResolvedValue({ activeRestaurantId: REST });

    const { getManagerPlanFeatures } = await import("@/lib/actions/restaurants");
    const features = await getManagerPlanFeatures();

    expect(features).toEqual({
      planName: "Trial",
      analyticsEnabled: true,
      aiSummaryEnabled: true,
      complaintsEnabled: true,
      employeeTrackingEnabled: true,
    });
  });

  it("reflects the active subscription's plan", async () => {
    mocks.prisma.restaurant.findUnique.mockResolvedValue({
      subscriptions: [
        {
          plan: {
            name: "Monthly",
            analyticsEnabled: false,
            aiSummaryEnabled: true,
            complaintsEnabled: true,
            employeeTrackingEnabled: true,
          },
        },
      ],
    });
    mocks.session.getSession.mockResolvedValue({ activeRestaurantId: REST });

    const { getManagerPlanFeatures } = await import("@/lib/actions/restaurants");
    const features = await getManagerPlanFeatures();

    expect(features.planName).toBe("Monthly");
    expect(features.analyticsEnabled).toBe(false);
    expect(features.employeeTrackingEnabled).toBe(true);
  });

  it("throws when there is no authenticated session", async () => {
    mocks.session.getSession.mockResolvedValue(null);

    const { getManagerPlanFeatures } = await import("@/lib/actions/restaurants");

    await expect(getManagerPlanFeatures()).rejects.toThrow("Unauthorized");
  });
});