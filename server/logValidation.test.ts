import { describe, expect, it } from "vitest";
import { createLogSchema } from "./logValidation";

describe("physical log validation contract", () => {
  it("requires a selected synced Metrc package", () => {
    expect(() => createLogSchema.parse({ type: "count", metrcPackageId: "", quantity: 1, location: "Sales floor" })).toThrow();
  });

  it("accepts zero for a physical count but rejects negative quantities", () => {
    expect(createLogSchema.parse({ type: "count", metrcPackageId: "pkg-1", quantity: 0, location: "Sales floor" })).toMatchObject({ type: "count", quantity: 0 });
    expect(() => createLogSchema.parse({ type: "count", metrcPackageId: "pkg-1", quantity: -1, location: "Sales floor" })).toThrow();
  });

  it("allows only the specified damage and discard reasons", () => {
    expect(createLogSchema.parse({ type: "damage", metrcPackageId: "pkg-1", quantity: 1, reason: "broken" })).toMatchObject({ reason: "broken" });
    expect(() => createLogSchema.parse({ type: "discard", metrcPackageId: "pkg-1", quantity: 1, reason: "unknown" })).toThrow();
  });

  it("validates lab status and received date", () => {
    expect(createLogSchema.parse({ type: "test_result", metrcPackageId: "pkg-1", testStatus: "passed", receivedAt: "2026-08-17T12:00:00Z" })).toMatchObject({ testStatus: "passed" });
    expect(() => createLogSchema.parse({ type: "test_result", metrcPackageId: "pkg-1", testStatus: "pending", receivedAt: "not-a-date" })).toThrow();
  });
});
