import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { startBillingCheckout, useBillingStatus } from "@/lib/billing";
import {
  Check,
  CircleHelp,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$149",
    description: "A focused command center for a single Oregon license.",
    features: [
      "1 license",
      "Up to 2 users",
      "Metrc reconciliation workspace",
      "Audit-ready PDF and CSV reports",
    ],
  },
  {
    key: "growth" as const,
    name: "Growth",
    price: "$349",
    description: "Operational coverage for growing, multi-license teams.",
    features: [
      "Up to 3 licenses",
      "Daily reconciliation sync",
      "Compliance alerts",
      "Priority implementation support",
    ],
    featured: true,
  },
];

export default function Pricing() {
  const { user, loading } = useAuth();
  const { billing } = useBillingStatus(Boolean(user));
  const [, setLocation] = useLocation();
  const [busyPlan, setBusyPlan] = useState<"starter" | "growth" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTrial = async (plan: "starter" | "growth") => {
    if (!user) {
      startLogin();
      return;
    }
    setError(null);
    setBusyPlan(plan);
    try {
      await startBillingCheckout(plan);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to start secure checkout."
      );
      setBusyPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f1f5ef] text-[#173f3a]">
      <div
        aria-hidden
        className="ambient-grid pointer-events-none absolute inset-0"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173f3a] text-white shadow-[0_8px_20px_rgba(23,63,58,0.2)]">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            MetrcMatch
          </span>
        </button>
        <Button
          variant="outline"
          onClick={() => (user ? setLocation("/workspace") : startLogin())}
          className="border-[#c9d5c8] bg-white/80 text-[#173f3a] hover:bg-white"
        >
          {user ? "Workspace" : "Sign in"}
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#b9d5bc] bg-[#e7f2e7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#356e45]">
            <Sparkles className="h-3.5 w-3.5" /> 14-day audit trial
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Start your compliance audit with a clear runway.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#61706b] sm:text-lg">
            Choose a plan, add a card to activate your trial, and connect
            MetrcMatch to your Oregon workflow. Your first charge occurs only
            after the 14-day trial ends.
          </p>
        </div>

        {billing?.isEntitled && (
          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-[#b9d5bc] bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-[#356e45]">
              <strong>Access is active.</strong> Your facility already has a
              trial or subscription.
            </p>
            <Button
              onClick={() => setLocation("/workspace")}
              className="bg-[#173f3a] hover:bg-[#0e2f2b]"
            >
              Open workspace
            </Button>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#efc1ba] bg-[#fff5f2] px-4 py-3 text-sm text-[#9d3324]"
          >
            {error}
          </div>
        )}

        <section className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map(plan => (
            <article
              key={plan.key}
              className={`relative flex min-h-[420px] flex-col rounded-[2rem] border p-7 shadow-[0_20px_60px_rgba(23,63,58,0.08)] ${plan.featured ? "border-[#5e8b62] bg-[#173f3a] text-white lg:-translate-y-3" : "command-surface border-[#dce3da] bg-white"}`}
            >
              {plan.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-[#bfe2c3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#173f3a]">
                  Most complete
                </span>
              )}
              <p
                className={`text-sm font-bold uppercase tracking-[0.14em] ${plan.featured ? "text-[#bfe2c3]" : "text-[#5e8b62]"}`}
              >
                {plan.name}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-[-0.05em]">
                  {plan.price}
                </span>
                <span
                  className={`mb-1 text-sm ${plan.featured ? "text-[#d6e2d6]" : "text-[#7d8a84]"}`}
                >
                  / month
                </span>
              </div>
              <p
                className={`mt-5 min-h-12 text-sm leading-6 ${plan.featured ? "text-[#d6e2d6]" : "text-[#61706b]"}`}
              >
                {plan.description}
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {plan.features.map(feature => (
                  <li key={feature} className="flex gap-2.5">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-[#bfe2c3]" : "text-[#356e45]"}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                disabled={loading || Boolean(busyPlan) || billing?.isEntitled}
                onClick={() => void startTrial(plan.key)}
                className={`mt-auto w-full ${plan.featured ? "bg-white text-[#173f3a] hover:bg-[#eaf0e9]" : "bg-[#173f3a] hover:bg-[#0e2f2b]"}`}
              >
                {busyPlan === plan.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening secure checkout
                  </>
                ) : (
                  "Start 14-day audit"
                )}
              </Button>
            </article>
          ))}
          <article className="command-surface flex min-h-[420px] flex-col rounded-[2rem] border border-[#dce3da] bg-[#eef4ed] p-7 shadow-[0_20px_60px_rgba(23,63,58,0.05)]">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#5e8b62]">
              Enterprise
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em]">
              Custom
            </h2>
            <p className="mt-5 text-sm leading-6 text-[#61706b]">
              For multi-license operators and MSOs that need a tailored
              workflow, dedicated support, and API access.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-[#173f3a]">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 text-[#356e45]" />
                Multi-license configuration
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 text-[#356e45]" />
                Dedicated implementation support
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 text-[#356e45]" />
                API access planning
              </li>
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-auto border-[#9eb69f] bg-white text-[#173f3a] hover:bg-[#f8fbf8]"
            >
              <a href="mailto:sales@metrcmatch.com?subject=MetrcMatch%20Enterprise%20Inquiry">
                Contact sales
              </a>
            </Button>
          </article>
        </section>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 rounded-3xl border border-[#dce3da] bg-white/80 p-5 text-sm text-[#61706b] sm:grid-cols-2 sm:p-7">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#356e45]" />
            <p>
              <strong className="text-[#173f3a]">
                Card required, charge deferred.
              </strong>{" "}
              Stripe securely collects your card now. MetrcMatch does not charge
              it until the trial ends.
            </p>
          </div>
          <div className="flex gap-3">
            <CircleHelp className="h-5 w-5 shrink-0 text-[#356e45]" />
            <p>
              <strong className="text-[#173f3a]">
                Facility-scoped access.
              </strong>{" "}
              Each active trial or subscription applies to one operating
              facility unless your plan states otherwise.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
