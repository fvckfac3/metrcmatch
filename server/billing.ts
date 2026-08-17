import Stripe from "stripe";
import { ENV } from "./_core/env";

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "MetrcMatch Starter",
    priceInCents: 14_900,
    users: 2,
    licenses: 1,
    description: "Single license, up to 2 users",
  },
  growth: {
    name: "MetrcMatch Growth",
    priceInCents: 34_900,
    users: null,
    licenses: 3,
    description: "Up to 3 licenses, daily sync, and alerts",
  },
  enterprise: {
    name: "MetrcMatch Enterprise",
    priceInCents: null,
    users: null,
    licenses: null,
    description: "Multi-license/MSO, dedicated support, and API access",
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  return typeof value === "string" && value in SUBSCRIPTION_PLANS;
}

export function getStripe() {
  if (!ENV.stripeSecretKey)
    throw new Error("Stripe billing is not configured.");
  return new Stripe(ENV.stripeSecretKey);
}

export function isFacilityEntitled(facility: {
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}) {
  if (facility.subscriptionStatus === "active") return true;
  return (
    facility.subscriptionStatus === "trialing" &&
    !!facility.trialEndsAt &&
    facility.trialEndsAt.getTime() > Date.now()
  );
}

async function findOrCreatePlanProduct(
  stripe: Stripe,
  plan: Exclude<SubscriptionPlan, "enterprise">
) {
  const config = SUBSCRIPTION_PLANS[plan];
  const products = await stripe.products.list({ active: true, limit: 100 });
  const existing = products.data.find(
    product => product.metadata.metrcmatch_plan === plan
  );
  if (existing) return existing;
  return stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: { metrcmatch_plan: plan },
  });
}

export async function ensurePlanPrice(
  stripe: Stripe,
  plan: Exclude<SubscriptionPlan, "enterprise">
) {
  const config = SUBSCRIPTION_PLANS[plan];
  const product = await findOrCreatePlanProduct(stripe, plan);
  const prices = await stripe.prices.list({
    active: true,
    product: product.id,
    type: "recurring",
    limit: 100,
  });
  const existing = prices.data.find(
    price =>
      price.unit_amount === config.priceInCents &&
      price.currency === "usd" &&
      price.recurring?.interval === "month"
  );
  if (existing) return existing;
  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: config.priceInCents!,
    recurring: { interval: "month" },
    metadata: { metrcmatch_plan: plan },
  });
}

export async function ensureStripeCustomer(
  stripe: Stripe,
  facility: { id: number; name: string; stripeCustomerId: string | null },
  user: { id: number; email: string | null; name: string | null }
) {
  if (facility.stripeCustomerId) return facility.stripeCustomerId;
  const customer = await stripe.customers.create({
    name: facility.name,
    ...(user.email ? { email: user.email } : {}),
    metadata: { facility_id: String(facility.id), user_id: String(user.id) },
  });
  return customer.id;
}
