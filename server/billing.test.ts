import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "owner" } }));
import {
  canAccessOperationalWorkspace,
  hasOwnerDemoAccess,
  isFacilityEntitled,
  isSubscriptionPlan,
  SUBSCRIPTION_PLANS,
} from "./billing";

describe("facility subscription entitlement", () => {
  it("allows active subscriptions regardless of a stale trial date", () => {
    expect(
      isFacilityEntitled({ subscriptionStatus: "active", trialEndsAt: null })
    ).toBe(true);
  });

  it("allows a trial only until the persisted trial-end timestamp", () => {
    expect(
      isFacilityEntitled({
        subscriptionStatus: "trialing",
        trialEndsAt: new Date(Date.now() + 1_000),
      })
    ).toBe(true);
    expect(
      isFacilityEntitled({
        subscriptionStatus: "trialing",
        trialEndsAt: new Date(Date.now() - 1_000),
      })
    ).toBe(false);
  });

  it("keeps inactive, past-due, canceled, and unpaid facilities out of operational access", () => {
    for (const subscriptionStatus of [
      "inactive",
      "past_due",
      "canceled",
      "unpaid",
    ]) {
      expect(
        isFacilityEntitled({ subscriptionStatus, trialEndsAt: null })
      ).toBe(false);
    }
  });

  it("allows only the configured owner to demonstrate an otherwise inactive workspace", () => {
    const inactiveFacility = {
      subscriptionStatus: "inactive",
      trialEndsAt: null,
    };
    expect(hasOwnerDemoAccess({ openId: "owner" })).toBe(true);
    expect(
      canAccessOperationalWorkspace({ openId: "owner" }, inactiveFacility)
    ).toBe(true);
    expect(hasOwnerDemoAccess({ openId: "another-user" })).toBe(false);
    expect(
      canAccessOperationalWorkspace(
        { openId: "another-user" },
        inactiveFacility
      )
    ).toBe(false);
  });

  it("exposes only the configured self-serve subscription plans", () => {
    expect(isSubscriptionPlan("starter")).toBe(true);
    expect(isSubscriptionPlan("growth")).toBe(true);
    expect(isSubscriptionPlan("enterprise")).toBe(true);
    expect(isSubscriptionPlan("custom")).toBe(false);
    expect(SUBSCRIPTION_PLANS.starter.priceInCents).toBe(14_900);
    expect(SUBSCRIPTION_PLANS.growth.priceInCents).toBe(34_900);
  });
});
