import { describe, it, expect, beforeEach, vi } from "vitest";

const qrSpy = vi.hoisted(() => ({ getPublicRestaurantByQr: vi.fn() }));
const nav = vi.hoisted(() => ({ redirect: vi.fn(), notFound: vi.fn() }));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    nav.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
  notFound: () => {
    nav.notFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/lib/actions/restaurants", () => ({
  getPublicRestaurantByQr: qrSpy.getPublicRestaurantByQr,
}));

import QrRedirectPage from "@/app/q/[code]/page";

const makeParams = (code: string) => Promise.resolve({ code });

describe("QR redirect", () => {
  beforeEach(() => {
    nav.redirect.mockReset();
    nav.notFound.mockReset();
    qrSpy.getPublicRestaurantByQr.mockReset();
  });

  it("lands a scan on the restaurant menu tab", async () => {
    qrSpy.getPublicRestaurantByQr.mockResolvedValue({ slug: "maison-rwanda" });

    await expect(QrRedirectPage({ params: makeParams("ABC123") })).rejects.toThrow("NEXT_REDIRECT");

    expect(qrSpy.getPublicRestaurantByQr).toHaveBeenCalledWith("ABC123");
    expect(nav.redirect).toHaveBeenCalledWith("/r/maison-rwanda?tab=menu&source=qr");
    expect(nav.notFound).not.toHaveBeenCalled();
  });

  it("404s for an unknown or deactivated code", async () => {
    qrSpy.getPublicRestaurantByQr.mockRejectedValue(new Error("Restaurant not found"));

    await expect(QrRedirectPage({ params: makeParams("DEADBEEF") })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    expect(nav.notFound).toHaveBeenCalled();
    expect(nav.redirect).not.toHaveBeenCalled();
  });
});