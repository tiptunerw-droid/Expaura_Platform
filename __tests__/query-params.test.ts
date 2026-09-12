import { describe, it, expect } from "vitest";
import { hrefWithParams, parseComplaintStatus } from "@/lib/utils";

describe("parseComplaintStatus", () => {
  it("accepts known statuses", () => {
    expect(parseComplaintStatus("PENDING")).toBe("PENDING");
    expect(parseComplaintStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
  });

  it("rejects unknown or empty values", () => {
    expect(parseComplaintStatus("nope")).toBeUndefined();
    expect(parseComplaintStatus(undefined)).toBeUndefined();
    expect(parseComplaintStatus("")).toBeUndefined();
  });
});

describe("hrefWithParams", () => {
  it("keeps existing params when patching status", () => {
    expect(
      hrefWithParams(
        "/dashboard/complaints",
        { status: "PENDING", category: "cat-1" },
        { status: "RESOLVED" },
      ),
    ).toBe("/dashboard/complaints?status=RESOLVED&category=cat-1");
  });

  it("clears a param when patch sets it empty", () => {
    expect(
      hrefWithParams(
        "/dashboard/complaints",
        { status: "PENDING", category: "cat-1" },
        { status: undefined },
      ),
    ).toBe("/dashboard/complaints?category=cat-1");
  });

  it("returns a bare path when nothing is set", () => {
    expect(hrefWithParams("/dashboard/complaints", {}, { status: undefined })).toBe(
      "/dashboard/complaints",
    );
  });
});
