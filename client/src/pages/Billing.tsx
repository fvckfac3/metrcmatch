import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { openBillingPortal, useBillingStatus } from "@/lib/billing";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";
}

function daysUntil(value: string | null) {
  if (!value) return null;
  return Math.max(
    0,
    Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000)
  );
}

export default function Billing() {
  const { user, loading } = useAuth();
  const { billing, isLoading, error, refresh } = useBillingStatus(
    Boolean(user)
  );
  const [, setLocation] = useLocation();
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const checkoutSuccess =
    new URLSearchParams(window.location.search).get("checkout") === "success";

  useEffect(() => {
    if (!checkoutSuccess || !user) return;
    const timer = window.setInterval(() => void refresh(), 3_000);
    return () => window.clearInterval(timer);
  }, [checkoutSuccess, refresh, user]);

  const manageBilling = async () => {
    setPortalError(null);
    setOpeningPortal(true);
    try {
      await openBillingPortal();
    } catch (cause) {
      setPortalError(
        cause instanceof Error
          ? cause.message
          : "Unable to open billing management."
      );
      setOpeningPortal(false);
    }
  };

  if (loading || (user && isLoading))
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#356e45]" />
      </div>
    );
  if (!user)
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-[#356e45]" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#173f3a]">
          Manage your facility plan
        </h1>
        <p className="mt-3 text-[#61706b]">
          Sign in to review your MetrcMatch trial or subscription.
        </p>
        <Button
          onClick={() => startLogin()}
          className="mt-7 bg-[#173f3a] hover:bg-[#0e2f2b]"
        >
          Sign in to continue
        </Button>
      </div>
    );

  const trialDays =
    billing?.status === "trialing" ? daysUntil(billing.trialEndsAt) : null;
  const hasIssue =
    billing?.status === "past_due" ||
    billing?.status === "unpaid" ||
    billing?.status === "canceled";

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-2 sm:py-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5e8b62]">
            Facility subscription
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#173f3a]">
            Billing & access
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#61706b]">
            Manage your card, plan, invoices, and trial status through Stripe’s
            secure billing portal.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="border-[#c9d5c8] bg-white text-[#173f3a]"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh status
        </Button>
      </div>
      {checkoutSuccess && (
        <div className="rounded-2xl border border-[#b9d5bc] bg-[#f3faf2] px-4 py-3 text-sm text-[#356e45]">
          <strong>Checkout submitted.</strong> We are confirming your trial
          activation. This page refreshes automatically for a short time.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-[#efc1ba] bg-[#fff5f2] px-4 py-3 text-sm text-[#9d3324]">
          {error.message}
        </div>
      )}
      {portalError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#efc1ba] bg-[#fff5f2] px-4 py-3 text-sm text-[#9d3324]"
        >
          {portalError}
        </div>
      )}
      <section className="command-surface overflow-hidden rounded-[2rem] border border-[#dce3da] bg-white shadow-[0_18px_55px_rgba(23,63,58,0.08)]">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${billing?.isEntitled ? "bg-[#4c9a57]" : hasIssue ? "bg-[#d95140]" : "bg-[#a7b1ac]"}`}
              />
              <p className="text-sm font-bold uppercase tracking-[0.13em] text-[#5e8b62]">
                {billing?.status ?? "Loading"}
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#173f3a]">
              {billing?.plan
                ? `${billing.plan.charAt(0).toUpperCase()}${billing.plan.slice(1)} plan`
                : "No active plan"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#61706b]">
              {trialDays !== null
                ? `${trialDays} day${trialDays === 1 ? "" : "s"} remain in your card-backed audit trial.`
                : billing?.isEntitled
                  ? "Your MetrcMatch facility access is active."
                  : "Choose a plan to activate a 14-day, card-backed audit trial."}
            </p>
          </div>
          <div className="flex items-start">
            <div className="rounded-2xl bg-[#eef4ed] p-3 text-[#356e45]">
              {trialDays !== null ? (
                <CalendarClock className="h-6 w-6" />
              ) : (
                <CreditCard className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-[#e5ebe4] bg-[#fafcf9] px-6 py-4 sm:px-8">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[#7d8a84]">Trial ends</dt>
              <dd className="mt-1 font-medium text-[#173f3a]">
                {formatDate(billing?.trialEndsAt ?? null)}
              </dd>
            </div>
            <div>
              <dt className="text-[#7d8a84]">Current period ends</dt>
              <dd className="mt-1 font-medium text-[#173f3a]">
                {formatDate(billing?.currentPeriodEndsAt ?? null)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
      {hasIssue && (
        <div className="flex gap-3 rounded-2xl border border-[#f1c9c3] bg-[#fff6f4] p-4 text-sm leading-6 text-[#8d3328]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Action may be needed.</strong> Your plan is not currently
            entitled to workspace access. Update your payment method or
            reactivate service in billing management.
          </p>
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#dce3da] bg-white p-6">
          <h2 className="font-semibold text-[#173f3a]">Plan selection</h2>
          <p className="mt-2 text-sm leading-6 text-[#61706b]">
            Compare Starter and Growth plans or start a card-backed 14-day audit
            trial.
          </p>
          <Button
            onClick={() => setLocation("/pricing")}
            variant="outline"
            className="mt-5 border-[#c9d5c8] bg-white text-[#173f3a]"
          >
            View plans <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-3xl border border-[#dce3da] bg-white p-6">
          <h2 className="font-semibold text-[#173f3a]">Billing management</h2>
          <p className="mt-2 text-sm leading-6 text-[#61706b]">
            Update payment methods, review invoices, or manage cancellation
            securely in Stripe.
          </p>
          <Button
            disabled={!billing?.hasBillingAccount || openingPortal}
            onClick={() => void manageBilling()}
            className="mt-5 bg-[#173f3a] hover:bg-[#0e2f2b]"
          >
            {openingPortal ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening portal
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Manage billing
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
