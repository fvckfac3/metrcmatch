import { describe, expect, it } from "vitest";
import { emailDeliveryReady } from "./notifications";

describe("emailDeliveryReady", () => {
  it("does not attempt delivery without a recipient or configured sender credentials", () => {
    expect(emailDeliveryReady(null)).toBe(false);
  });
});
