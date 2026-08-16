import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleAlert, ClipboardCheck, Clock3, FileText, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { useLocation } from "wouter";
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

const trend = [
  { day: "Mon", count: 6 }, { day: "Tue", count: 5 }, { day: "Wed", count: 4 }, { day: "Thu", count: 4 }, { day: "Fri", count: 2 }, { day: "Sat", count: 2 }, { day: "Sun", count: 1 },
];

function Metric({ label, value, note, icon: Icon, accent = "green" }: { label: string; value: string | number; note: string; icon: typeof ShieldCheck; accent?: "green" | "amber" | "red" | "slate" }) {
  const colors = { green: "bg-[#dfeee0] text-[#205b35]", amber: "bg-[#fff0c7] text-[#815b10]", red: "bg-[#fbe2df] text-[#9b2c2c]", slate: "bg-[#eaf0ed] text-[#52625d]" };
  return <Card className="border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#83908a]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-[#173f3a]">{value}</p></div><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[accent]}`}><Icon className="h-[18px] w-[18px]" /></span></div><p className="mt-3 text-xs leading-5 text-[#7d8a84]">{note}</p></CardContent></Card>;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const dashboard = trpc.discrepancies.dashboard.useQuery();
  const sync = trpc.metrc.syncNow.useMutation({ onSuccess: data => { toast.success(`Sync complete: ${data.inventoryItems} inventory records checked.`); void utils.discrepancies.dashboard.invalidate(); void utils.metrc.history.invalidate(); }, onError: error => toast.error(error.message) });
  const data = dashboard.data;
  const riskTone = data?.auditRisk.level === "red" ? "red" : data?.auditRisk.level === "yellow" ? "yellow" : "green";
  const riskIcon = data?.auditRisk.level === "red" ? TriangleAlert : data?.auditRisk.level === "yellow" ? CircleAlert : ShieldCheck;

  if (dashboard.isLoading) return <div className="space-y-6"><Skeleton className="h-28 rounded-3xl" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}</div></div>;
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-[#173f3a] px-6 py-6 text-white shadow-[0_18px_55px_rgba(18,53,47,0.18)] sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="mb-3 flex items-center gap-2 text-sm text-[#c9dfca]"><span className="h-2 w-2 rounded-full bg-[#8bc68e]" /> Oregon retail reconciliation</div><h1 className="text-3xl font-semibold tracking-tight sm:text-[34px]">Compliance control center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8e6d8]">Review what needs attention, log the physical reality, and keep a clear reconciliation record for your facility.</p></div>
        <div className="flex flex-wrap gap-2"><Button onClick={() => sync.mutate()} disabled={sync.isPending} className="h-11 bg-white px-4 text-[#173f3a] hover:bg-[#e7f1e7]"><RefreshCw className={`mr-2 h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />{sync.isPending ? "Syncing…" : "Sync now"}</Button><Button variant="outline" onClick={() => setLocation("/reports")} className="h-11 border-[#6f9980] bg-transparent px-4 text-white hover:bg-[#27524c] hover:text-white"><FileText className="mr-2 h-4 w-4" />Generate report</Button></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Audit risk" value={data?.auditRisk.label ?? "Not assessed"} note={data?.auditRisk.recommendation ?? "Connect Metrc and log physical counts to assess risk."} icon={riskIcon} accent={riskTone === "green" ? "green" : riskTone === "yellow" ? "amber" : "red"} />
        <Metric label="Metrc inventory" value={data?.products ?? 0} note={data?.connection?.lastSyncedAt ? `Last sync: ${new Date(data.connection.lastSyncedAt).toLocaleString()}` : "No successful sync recorded"} icon={RefreshCw} accent="slate" />
        <Metric label="Counts logged" value={data?.reconciledThisWeek ?? 0} note="Physical count entries from the last 7 days" icon={CheckCircle2} accent="green" />
        <Metric label="Open discrepancies" value={(data?.severities.critical ?? 0) + (data?.severities.high ?? 0) + (data?.severities.medium ?? 0)} note={`${data?.severities.critical ?? 0} critical · ${data?.severities.high ?? 0} high · ${data?.severities.medium ?? 0} medium`} icon={AlertTriangle} accent={(data?.severities.critical ?? 0) > 0 ? "red" : (data?.severities.high ?? 0) > 0 ? "amber" : "slate"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]"><CardContent className="p-0"><div className="flex items-center justify-between p-5 sm:p-6"><div><h2 className="text-lg font-semibold text-[#173f3a]">Open discrepancies</h2><p className="mt-1 text-sm text-[#7d8a84]">Ranked by operational severity</p></div><Button variant="ghost" onClick={() => setLocation("/discrepancies")} className="text-[#205b35] hover:bg-[#edf5ed] hover:text-[#173f3a]">Review all <ArrowRight className="ml-1.5 h-4 w-4" /></Button></div>
            {data?.discrepancies.length ? <div className="border-t border-[#eef1ee]">{data.discrepancies.slice(0, 5).map(item => <button key={item.id} onClick={() => setLocation("/discrepancies")} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#eef1ee] px-5 py-4 text-left transition-colors hover:bg-[#f7faf6] sm:px-6"><span className={`h-2.5 w-2.5 rounded-full ${item.severity === "critical" ? "bg-[#c2413c]" : item.severity === "high" ? "bg-[#d39424]" : "bg-[#5e8b62]"}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#203b35]">{item.productName}</p><p className="mt-1 truncate text-xs text-[#7d8a84]">{item.likelyCause}</p></div><div className="text-right"><StatusPill tone={item.severity === "critical" ? "red" : item.severity === "high" ? "yellow" : "neutral"}>{item.severity}</StatusPill><p className="mt-1.5 text-xs font-medium text-[#61706b]">{item.variancePercent}% variance</p></div></button>)}</div> : <div className="border-t border-dashed border-[#dce3da] px-6 py-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-[#5e8b62]" /><p className="mt-3 font-semibold text-[#173f3a]">No open discrepancies</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#7d8a84]">Sync inventory and log a physical count to keep this view current.</p><Button variant="outline" onClick={() => setLocation("/logs")} className="mt-4 border-[#b8cbb9] text-[#205b35]">Log a physical count</Button></div>}
          </CardContent></Card>
        <Card className="border-[#dce3da] bg-white shadow-[0_8px_22px_rgba(18,53,47,0.045)]"><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#173f3a]">Weekly trend</h2><p className="mt-1 text-sm text-[#7d8a84]">Open discrepancy volume</p></div><Tooltip><TooltipTrigger asChild><button aria-label="Trend information" className="grid h-8 w-8 place-items-center rounded-lg text-[#7d8a84] hover:bg-[#f0f5ef]"><Clock3 className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>Trend visualization is available once reconciliation history accumulates.</TooltipContent></Tooltip></div><div className="mt-5 h-[205px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}><defs><linearGradient id="openDiscrepancyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5e8b62" stopOpacity={0.32} /><stop offset="100%" stopColor="#5e8b62" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#87958e" }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#87958e" }} /><ChartTooltip contentStyle={{ borderRadius: 12, borderColor: "#dce3da", fontSize: 12 }} /><Area type="monotone" dataKey="count" stroke="#356e45" strokeWidth={2.5} fill="url(#openDiscrepancyGradient)" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3"><button onClick={() => setLocation("/logs")} className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"><ClipboardCheck className="h-5 w-5 text-[#356e45]" /><h3 className="mt-4 font-semibold text-[#173f3a]">Log physical reality</h3><p className="mt-1 text-sm leading-6 text-[#7d8a84]">Count, damage, discard, or lab result.</p></button><button onClick={() => setLocation("/settings")} className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"><RefreshCw className="h-5 w-5 text-[#356e45]" /><h3 className="mt-4 font-semibold text-[#173f3a]">Connect Metrc</h3><p className="mt-1 text-sm leading-6 text-[#7d8a84]">Securely configure API credentials and sync.</p></button><button onClick={() => setLocation("/reports")} className="group rounded-2xl border border-[#dce3da] bg-white p-5 text-left shadow-[0_8px_22px_rgba(18,53,47,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#b8cbb9] hover:shadow-[0_13px_28px_rgba(18,53,47,0.08)]"><FileText className="h-5 w-5 text-[#356e45]" /><h3 className="mt-4 font-semibold text-[#173f3a]">Prepare a report</h3><p className="mt-1 text-sm leading-6 text-[#7d8a84]">Create a PDF or CSV reconciliation record.</p></button></section>
    </div>
  );
}
