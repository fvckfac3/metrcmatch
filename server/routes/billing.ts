import express, { type Express, type Request, type Response } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { ENV } from "../_core/env";
import {
  ensurePlanPrice,
  ensureStripeCustomer,
  getStripe,
  isFacilityEntitled,
  isSubscriptionPlan,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "../billing";
import * as db from "../db";
import { ApiError, requireFacilityContext, sendRouteError } from "../http";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "growth"]),
});

const BILLING_STATUSES = new Set([
  "inactive",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

function toBillingStatus(status: string) {
  return BILLING_STATUSES.has(status)
    ? (status as
        | "inactive"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid")
    : "inactive";
}

function unixToDate(value: number | null | undefined) {
  return value ? new Date(value * 1_000) : null;
}

function getSubscriptionId(subscription: string | Stripe.Subscription | null) {
  return typeof subscription === "string"
    ? subscription
    : (subscription?.id ?? null);
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) {
  return typeof customer === "string" ? customer : (customer?.id ?? null);
}

function getPlanFromSubscription(
  subscription: Stripe.Subscription
): SubscriptionPlan | null {
  const candidate = subscription.metadata.metrcmatch_plan;
  return isSubscriptionPlan(candidate) ? candidate : null;
}

async function persistSubscription(
  subscription: Stripe.Subscription,
  facilityId?: number
) {
  const customerId = getCustomerId(subscription.customer);
  const target =
    (facilityId ? await db.getFacility(facilityId) : undefined) ??
    (await db.getFacilityByStripeSubscription(subscription.id)) ??
    (customerId ? await db.getFacilityByStripeCustomer(customerId) : undefined);
  if (!target) return null;
  const subscriptionPlan =
    getPlanFromSubscription(subscription) ?? target.subscriptionPlan;
  return db.updateFacilityBilling(target.id, {
    stripeCustomerId: customerId ?? target.stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    subscriptionPlan,
    subscriptionStatus: toBillingStatus(subscription.status),
    trialEndsAt: unixToDate(subscription.trial_end),
    currentPeriodEndsAt: unixToDate(
      subscription.items.data[0]?.current_period_end
    ),
  });
}

function getSafeBaseUrl(req: Request) {
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("host");
  if (!host)
    throw new ApiError(500, "Unable to determine the application URL.");
  return `${protocol}://${host}`;
}

async function getWebhookEvent(req: Request) {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string")
    throw new ApiError(
      400,
      "Missing Stripe signature.",
      "STRIPE_SIGNATURE_MISSING"
    );
  if (!ENV.stripeWebhookSecret)
    throw new ApiError(
      503,
      "Stripe webhook verification is not configured.",
      "STRIPE_WEBHOOK_UNAVAILABLE"
    );
  try {
    return getStripe().webhooks.constructEvent(
      req.body,
      signature,
      ENV.stripeWebhookSecret
    );
  } catch (error) {
    throw new ApiError(
      400,
      `Stripe signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "STRIPE_SIGNATURE_INVALID"
    );
  }
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  try {
    const event = await getWebhookEvent(req);
    if (event.id.startsWith("evt_test_")) return res.json({ verified: true });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const facilityId = Number(
          session.metadata?.facility_id ?? session.client_reference_id
        );
        const customerId = getCustomerId(session.customer);
        const subscriptionId = getSubscriptionId(session.subscription);
        if (Number.isSafeInteger(facilityId) && facilityId > 0) {
          await db.updateFacilityBilling(facilityId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionPlan: isSubscriptionPlan(session.metadata?.plan)
              ? session.metadata.plan
              : undefined,
          });
          if (subscriptionId) {
            const subscription =
              await getStripe().subscriptions.retrieve(subscriptionId);
            await persistSubscription(subscription, facilityId);
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await persistSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        const facility = customerId
          ? await db.getFacilityByStripeCustomer(customerId)
          : undefined;
        if (facility)
          await db.updateFacilityBilling(facility.id, {
            subscriptionStatus: "past_due",
          });
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (error) {
    return sendRouteError(res, error, {
      scope: "Stripe webhook",
      fallback: "Stripe webhook handling failed.",
    });
  }
}

export function registerStripeWebhookRoute(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
  );
}

export function registerBillingRoutes(app: Express) {
  app.get("/api/billing/status", async (req, res) => {
    try {
      const { facility } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot view billing status."
      );
      return res.json({
        plan: facility.subscriptionPlan,
        status: facility.subscriptionStatus,
        trialEndsAt: facility.trialEndsAt,
        currentPeriodEndsAt: facility.currentPeriodEndsAt,
        isEntitled: isFacilityEntitled(facility),
        hasBillingAccount: Boolean(facility.stripeCustomerId),
      });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Billing status",
        fallback: "Unable to load billing status.",
      });
    }
  });

  app.post("/api/billing/checkout", async (req, res) => {
    try {
      const { plan } = checkoutSchema.parse(req.body);
      const { facility, user } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot start checkout."
      );
      if (isFacilityEntitled(facility)) {
        throw new ApiError(
          409,
          "Your facility already has an active trial or subscription. Use billing management to update it.",
          "SUBSCRIPTION_ALREADY_ACTIVE"
        );
      }
      const stripe = getStripe();
      const customerId = await ensureStripeCustomer(stripe, facility, user);
      if (customerId !== facility.stripeCustomerId)
        await db.updateFacilityBilling(facility.id, {
          stripeCustomerId: customerId,
        });
      const price = await ensurePlanPrice(stripe, plan);
      const origin = getSafeBaseUrl(req);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: String(facility.id),
        line_items: [{ price: price.id, quantity: 1 }],
        payment_method_types: ["card"],
        payment_method_collection: "always",
        billing_address_collection: "auto",
        success_url: `${origin}/billing?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=canceled`,
        metadata: { facility_id: String(facility.id), plan },
        subscription_data: {
          trial_period_days: 14,
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
          metadata: { facility_id: String(facility.id), metrcmatch_plan: plan },
        },
      });
      if (!session.url)
        throw new ApiError(
          502,
          "Stripe did not return a checkout URL.",
          "STRIPE_CHECKOUT_UNAVAILABLE"
        );
      return res.json({ url: session.url });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Billing checkout",
        fallback: "Unable to start secure checkout.",
        validationMessage: "Choose a valid subscription plan.",
      });
    }
  });

  app.post("/api/billing/portal", async (req, res) => {
    try {
      const { facility } = await requireFacilityContext(
        req,
        "Scheduled sessions cannot manage billing."
      );
      if (!facility.stripeCustomerId)
        throw new ApiError(
          409,
          "No Stripe billing account exists for this facility.",
          "BILLING_ACCOUNT_MISSING"
        );
      const session = await getStripe().billingPortal.sessions.create({
        customer: facility.stripeCustomerId,
        return_url: `${getSafeBaseUrl(req)}/billing`,
      });
      return res.json({ url: session.url });
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Billing portal",
        fallback: "Unable to open billing management.",
      });
    }
  });
}
