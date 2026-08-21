import { useCallback, useEffect, useState } from "react";

export type BillingStatus = {
  plan: "starter" | "growth" | "enterprise" | null;
  status:
    | "inactive"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  isEntitled: boolean;
  ownerDemoAccess: boolean;
  hasBillingAccount: boolean;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Billing request failed.");
  return body as T;
}

export async function loadBillingStatus() {
  return readJson<BillingStatus>(
    await fetch("/api/billing/status", { credentials: "include" })
  );
}

export async function startBillingCheckout(plan: "starter" | "growth") {
  const data = await readJson<{ url: string }>(
    await fetch("/api/billing/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
  );
  window.location.assign(data.url);
}

export async function openBillingPortal() {
  const data = await readJson<{ url: string }>(
    await fetch("/api/billing/portal", {
      method: "POST",
      credentials: "include",
    })
  );
  window.location.assign(data.url);
}

export function useBillingStatus(enabled: boolean) {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      setBilling(await loadBillingStatus());
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause
          : new Error("Unable to load billing status.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setBilling(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  return { billing, isLoading, error, refresh };
}
