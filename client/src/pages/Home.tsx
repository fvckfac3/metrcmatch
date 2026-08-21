import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type Discrepancy = {
  id: number;
  productName: string;
  severity: "critical" | "high" | "medium";
  status: string;
  variancePercent: number | string;
  likelyCause: string;
  detectedAt: string | Date;
};
type DashboardStatus = {
  connection: { connectionStatus: string; lastSyncedAt: string | Date | null };
  products: number;
  reconciledThisWeek: number;
  severities: { critical: number; high: number; medium: number };
  auditRisk: {
    level: "green" | "yellow" | "red";
    label: string;
    recommendation: string;
  };
  trend: Array<{ day: string; count: number; syncs: number }>;
};

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(body.error ?? `Request failed with ${response.status}`);
  return body;
}

function Metric({
  label,
  value,
  note,
  icon: Icon,
  accent = "green",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof ShieldCheck;
  accent?: "green" | "amber" | "red" | "slate";
}) {
  const colors = {
    green: "bg-[#dfeee0] text-[#205b35]",
    amber: "bg-[#fff0c7] text-[#815b10]",
    red: "bg-[#fbe2df] text-[#9b2c2c]",
    slate: "bg-[#eaf0ed] text-[#52625d]",
  };
  return (
    <Card className="surface-lift motion-rise border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#83908a]">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#173f3a]">
              {value}
            </p>
          </div>
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl ${colors[accent]}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#7d8a84]">{note}</p>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"severity" | "date" | "product">("severity");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusResult, discrepancyResult] = await Promise.all([
        readJson<DashboardStatus>("/api/metrc/status"),
        readJson<{ discrepancies: Discrepancy[] }>("/api/discrepancies/list"),
      ]);
      setStatus(statusResult);
      setDiscrepancies(discrepancyResult.discrepancies ?? []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const sortedDiscrepancies = useMemo(
    () =>
      [...discrepancies].sort((a, b) =>
        sort === "date"
          ? new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
          : sort === "product"
            ? a.productName.localeCompare(b.productName)
            : { critical: 0, high: 1, medium: 2 }[a.severity] -
              { critical: 0, high: 1, medium: 2 }[b.severity]
      ),
    [discrepancies, sort]
  );
  const openCount =
    (status?.severities.critical ?? 0) +
    (status?.severities.high ?? 0) +
    (status?.severities.medium ?? 0);
  const riskIcon =
    status?.auditRisk.level === "red"
      ? TriangleAlert
      : status?.auditRisk.level === "yellow"
        ? AlertTriangle
        : ShieldCheck;
  const riskAccent =
    status?.auditRisk.level === "red"
      ? "red"
      : status?.auditRisk.level === "yellow"
        ? "amber"
        : "green";

  const syncNow = async () => {
    setSyncing(true);
    try {
      const result = await readJson<{ inventoryItems: number }>(
        "/api/metrc/sync",
        { method: "POST" }
      );
      toast.success(
        `Sync complete: ${result.inventoryItems} inventory records checked.`
      );
      await loadDashboard();
    } catch (requestError) {
      toast.error(
        requestError instanceof Error ? requestError.message : "Sync failed."
      );
    } finally {
      setSyncing(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#f0c6c1] bg-[#fff7f6] p-8 text-center">
        <TriangleAlert className="mx-auto h-9 w-9 text-[#b3453d]" />
        <h1 className="mt-4 text-xl font-semibold text-[#6d2522]">
          Dashboard data unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#815b78]">{error}</p>
        <Button
          onClick={() => void loadDashboard()}
          className="mt-5 bg-[#173f3a] hover:bg-[#0e2f2b]"
        >
          Try again
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <section className="motion-rise relative flex flex-col gap-4 overflow-hidden rounded-[2rem] bg-[#173f3a] px-6 py-6 text-white shadow-[0_18px_55px_rgba(18,53,47,0.18)] sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
        <div
          aria-hidden
          className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#9dd1a3]/20 shadow-[0_0_0_28px_rgba(157,209,163,0.04),0_0_0_56px_rgba(157,209,163,0.03)]"
        />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-sm text-[#c9dfca]">
            <span className="h-2 w-2 rounded-full bg-[#8bc68e]" /> Oregon retail
            reconciliation
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[34px]">
            Compliance control center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8e6d8]">
            A manager view of Metrc freshness, physical reconciliation, open
            risk, and next actions.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          <Button
            onClick={() => void syncNow()}
            disabled={syncing}
            className="h-11 bg-white px-4 text-[#173f3a] hover:bg-[#e7f1e7]"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/reports")}
            className="h-11 border-[#6f9980] bg-transparent px-4 text-white hover:bg-[#27524c] hover:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate report
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 [&>*:nth-child(1)]:motion-delay-1 [&>*:nth-child(2)]:motion-delay-2 [&>*:nth-child(3)]:motion-delay-3 [&>*:nth-child(4)]:motion-delay-4 [&>*:nth-child(5)]:motion-delay-4">
        <Metric
          label="Audit status"
          value={status?.auditRisk.label ?? "Not assessed"}
          note={
            status?.auditRisk.recommendation ??
            "Connect Metrc and log physical counts to assess risk."
          }
          icon={riskIcon}
          accent={riskAccent}
        />
        <Metric
          label="Last sync"
          value={
            status?.connection?.lastSyncedAt
              ? new Date(status.connection.lastSyncedAt).toLocaleDateString()
              : "Never"
          }
          note={
            status?.connection?.lastSyncedAt
              ? new Date(status.connection.lastSyncedAt).toLocaleTimeString(
                  [],
                  { hour: "numeric", minute: "2-digit" }
                )
              : "No successful sync recorded"
          }
          icon={RefreshCw}
          accent="slate"
        />
        <Metric
          label="Products"
          value={status?.products ?? 0}
          note="Current synced Metrc inventory records"
          icon={ClipboardCheck}
          accent="slate"
        />
        <Metric
          label="Reconciled this week"
          value={status?.reconciledThisWeek ?? 0}
          note="Physical count entries from the last 7 days"
          icon={CheckCircle2}
          accent="green"
        />
        <Metric
          label="Discrepancies"
          value={openCount}
          note={`${status?.severities.critical ?? 0} critical · ${status?.severities.high ?? 0} high · ${status?.severities.medium ?? 0} medium`}
          icon={AlertTriangle}
          accent={
            status?.severities.critical
              ? "red"
              : status?.severities.high
                ? "amber"
                : "slate"
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="surface-lift motion-rise border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-[#eef1ee] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-[#173f3a]">
                  Discrepancy queue
                </h2>
                <p className="mt-1 text-sm text-[#7d8a84]">
                  Sort by operational severity, date, or product.
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  aria-label="Sort discrepancies"
                  value={sort}
                  onChange={event => setSort(event.target.value as typeof sort)}
                  className="h-10 rounded-xl border border-[#ccd8cf] bg-white px-3 text-sm text-[#30453f]"
                >
                  <option value="severity">Severity</option>
                  <option value="date">Most recent</option>
                  <option value="product">Product</option>
                </select>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/discrepancies")}
                  className="text-[#205b35] hover:bg-[#edf5ed] hover:text-[#173f3a]"
                >
                  Review <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            {sortedDiscrepancies.length ? (
              <div>
                {sortedDiscrepancies.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLocation("/discrepancies")}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#eef1ee] px-5 py-4 text-left transition-colors hover:bg-[#f7faf6] sm:px-6"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.severity === "critical" ? "bg-[#c2413c]" : item.severity === "high" ? "bg-[#d39424]" : "bg-[#5e8b62]"}`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#203b35]">
                        {item.productName}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#7d8a84]">
                        {item.likelyCause} ·{" "}
                        {new Date(item.detectedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="text-right">
                      <StatusPill
                        tone={
                          item.severity === "critical"
                            ? "red"
                            : item.severity === "high"
                              ? "yellow"
                              : "neutral"
                        }
                      >
                        {item.severity}
                      </StatusPill>
                      <span className="mt-1.5 block text-xs font-medium text-[#61706b]">
                        {item.variancePercent}% variance
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#5e8b62]" />
                <p className="mt-3 font-semibold text-[#173f3a]">
                  No open discrepancies
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#7d8a84]">
                  Sync inventory and log a physical count to keep this view
                  current.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-lift motion-rise border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#173f3a]">
                  Discrepancy trend
                </h2>
                <p className="mt-1 text-sm text-[#7d8a84]">
                  Synced inventory items across the last 7 days.
                </p>
              </div>
              <StatusPill
                tone={
                  status?.connection?.connectionStatus === "connected"
                    ? "green"
                    : "neutral"
                }
              >
                <span className="mono-meta">
                  {status?.connection?.connectionStatus?.replace("_", " ") ??
                    "not connected"}
                </span>
              </StatusPill>
            </div>
            <div className="mt-5 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={status?.trend ?? []}
                  margin={{ top: 10, right: 4, bottom: 0, left: -24 }}
                >
                  <defs>
                    <linearGradient
                      id="managerTrend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#5e8b62"
                        stopOpacity={0.34}
                      />
                      <stop
                        offset="100%"
                        stopColor="#5e8b62"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef1ee" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#87958e" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#87958e" }}
                  />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#dce3da",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#356e45"
                    strokeWidth={2.5}
                    fill="url(#managerTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => setLocation("/logs")}
          className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"
        >
          <ClipboardCheck className="h-5 w-5 text-[#356e45]" />
          <h3 className="mt-4 font-semibold text-[#173f3a]">
            Log physical reality
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#7d8a84]">
            Count, damage, discard, or lab result.
          </p>
        </button>
        <button
          onClick={() => setLocation("/discrepancies")}
          className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"
        >
          <AlertTriangle className="h-5 w-5 text-[#356e45]" />
          <h3 className="mt-4 font-semibold text-[#173f3a]">
            Review discrepancies
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#7d8a84]">
            Prioritize variance by severity and cause.
          </p>
        </button>
        <button
          onClick={() => setLocation("/reports")}
          className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"
        >
          <FileText className="h-5 w-5 text-[#356e45]" />
          <h3 className="mt-4 font-semibold text-[#173f3a]">
            Generate a report
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#7d8a84]">
            Create a PDF or CSV reconciliation record.
          </p>
        </button>
      </section>
    </div>
  );
}
