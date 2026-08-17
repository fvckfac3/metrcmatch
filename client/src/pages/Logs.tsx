import { ProductPicker } from "@/components/ProductPicker";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, ClipboardCheck, FlaskConical, PackageX, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type LogMode = "count" | "damage" | "test";

export default function Logs() {
  const [mode, setMode] = useState<LogMode>("count");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState<"broken" | "expired" | "theft" | "waste" | "other">("broken");
  const [discard, setDiscard] = useState(false);
  const [notes, setNotes] = useState("");
  const [testStatus, setTestStatus] = useState<"passed" | "failed">("passed");
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const logs = trpc.logs.list.useQuery({ query });
  const reset = () => { setProduct(""); setQuantity(""); setLocation(""); setNotes(""); setQuery(""); };
  const refresh = () => { void utils.logs.list.invalidate(); void utils.discrepancies.dashboard.invalidate(); void utils.discrepancies.list.invalidate(); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmed(null);
    if (!product) return toast.error("Select a product from the synced Metrc inventory.");
    const numericQuantity = Number(quantity);
    if (mode === "count" && (!Number.isFinite(numericQuantity) || numericQuantity < 0 || !location.trim())) return toast.error("Enter a valid count and location.");
    if (mode === "damage" && (!Number.isFinite(numericQuantity) || numericQuantity <= 0)) return toast.error("Enter an affected quantity greater than zero.");
    if (mode === "test" && !receivedAt) return toast.error("Choose the date the result was received.");
    const body = mode === "count" ? { type: "count", metrcPackageId: product, quantity: numericQuantity, location: location.trim() } : mode === "damage" ? { type: discard ? "discard" : "damage", metrcPackageId: product, quantity: numericQuantity, reason, notes: notes.trim() || undefined } : { type: "test_result", metrcPackageId: product, testStatus, receivedAt: new Date(`${receivedAt}T12:00:00`).toISOString() };
    setPending(true);
    try {
      const response = await fetch("/api/logs/create", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const result = await response.json() as { success?: boolean; mismatch?: boolean; timestamp?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save physical log.");
      const message = mode === "test" && result.mismatch ? "Lab result saved; review the mismatch against Metrc." : mode === "count" ? "Physical count saved and reconciliation refreshed." : `${discard ? "Discard" : "Damage"} entry saved.`;
      setConfirmed(message);
      toast.success(message);
      reset();
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save physical log.");
    } finally {
      setPending(false);
    }
  };

  return <div className="motion-rise mx-auto max-w-6xl space-y-6"><div><p className="text-sm font-semibold text-[#356e45]">Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#173f3a]">Log physical reality</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f7d77]">Designed for a fast, clear entry at the point of count. Timestamps are recorded automatically.</p></div>
    {confirmed && <div role="status" className="flex items-start gap-3 rounded-2xl border border-[#b8cbb9] bg-[#eaf4e8] px-4 py-3 text-sm font-medium text-[#205b35]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><div><p>Saved successfully</p><p className="mt-0.5 font-normal text-[#52625d]">{confirmed} The system timestamped this entry automatically.</p></div></div>}
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="surface-lift motion-rise motion-delay-1 border-[#dce3da] bg-white shadow-[0_12px_28px_rgba(18,53,47,0.05)]"><CardContent className="p-4 sm:p-6"><div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#e7efe5] p-1.5 shadow-[inset_0_1px_2px_rgba(18,53,47,0.07)]"><button onClick={() => setMode("count")} className={`rounded-lg px-2 py-3 text-xs font-semibold transition-colors ${mode === "count" ? "bg-white text-[#173f3a] shadow-sm" : "text-[#708078] hover:text-[#173f3a]"}`}>Count</button><button onClick={() => setMode("damage")} className={`rounded-lg px-2 py-3 text-xs font-semibold transition-colors ${mode === "damage" ? "bg-white text-[#173f3a] shadow-sm" : "text-[#708078] hover:text-[#173f3a]"}`}>Damage / discard</button><button onClick={() => setMode("test")} className={`rounded-lg px-2 py-3 text-xs font-semibold transition-colors ${mode === "test" ? "bg-white text-[#173f3a] shadow-sm" : "text-[#708078] hover:text-[#173f3a]"}`}>Lab result</button></div>
        <form onSubmit={submit} className="mt-6 space-y-5">
          {mode === "count" && <div className="mb-2 rounded-xl bg-[#eaf4e8] p-3 text-sm text-[#356e45]"><ClipboardCheck className="mr-2 inline h-4 w-4" />Record the current physical quantity at this location.</div>}
          {mode === "damage" && <div className="mb-2 rounded-xl bg-[#fff4db] p-3 text-sm text-[#815b10]"><PackageX className="mr-2 inline h-4 w-4" />Log the actual issue now. Complete required Metrc reporting separately.</div>}
          {mode === "test" && <div className="mb-2 rounded-xl bg-[#eef5f5] p-3 text-sm text-[#35676b]"><FlaskConical className="mr-2 inline h-4 w-4" />Compare the returned result with the current Metrc testing status.</div>}
          <ProductPicker value={product} onChange={setProduct} />
          {mode === "count" && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="count-quantity">Quantity counted</Label><Input id="count-quantity" inputMode="decimal" type="number" min="0" step="0.001" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-12 border-[#ccd8cf] text-base" placeholder="0" /></div><div className="space-y-2"><Label htmlFor="count-location">Location</Label><Input id="count-location" value={location} onChange={e => setLocation(e.target.value)} className="h-12 border-[#ccd8cf] text-base" placeholder="e.g., Sales floor" /></div></div>}
          {mode === "damage" && <><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="damage-quantity">Affected quantity</Label><Input id="damage-quantity" inputMode="decimal" type="number" min="0.001" step="0.001" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-12 border-[#ccd8cf] text-base" placeholder="0" /></div><div className="space-y-2"><Label htmlFor="reason">Reason</Label><select id="reason" value={reason} onChange={e => setReason(e.target.value as typeof reason)} className="h-12 w-full rounded-xl border border-[#ccd8cf] bg-white px-3 text-sm text-[#173f3a]"><option value="broken">broken</option><option value="expired">expired</option><option value="theft">theft</option><option value="waste">waste</option><option value="other">other</option></select></div></div><label className="flex items-center gap-3 rounded-xl border border-[#dce3da] p-3 text-sm text-[#30453f]"><input type="checkbox" checked={discard} onChange={e => setDiscard(e.target.checked)} className="h-4 w-4 accent-[#356e45]" />This is a discard rather than damage.</label><div className="space-y-2"><Label htmlFor="damage-notes">Notes <span className="font-normal text-[#87958e]">(optional)</span></Label><Textarea id="damage-notes" value={notes} onChange={e => setNotes(e.target.value)} className="min-h-24 border-[#ccd8cf]" placeholder="Add helpful context for your manager…" /></div></>}
          {mode === "test" && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="test-status">Test status</Label><select id="test-status" value={testStatus} onChange={e => setTestStatus(e.target.value as "passed" | "failed")} className="h-12 w-full rounded-xl border border-[#ccd8cf] bg-white px-3 text-sm text-[#173f3a]"><option value="passed">passed</option><option value="failed">failed</option></select></div><div className="space-y-2"><Label htmlFor="received-at">Date received</Label><Input id="received-at" type="date" value={receivedAt} onChange={e => setReceivedAt(e.target.value)} className="h-12 border-[#ccd8cf]" /></div></div>}
          <Button type="submit" size="lg" disabled={pending} className="h-13 w-full bg-[#173f3a] text-base hover:bg-[#0e2f2b]"><CheckCircle2 className="mr-2 h-5 w-5" />{pending ? "Saving…" : mode === "count" ? "Save physical count" : mode === "damage" ? `Save ${discard ? "discard" : "damage"} log` : "Save lab result"}</Button>
        </form></CardContent></Card>
      <Card className="surface-lift motion-rise motion-delay-1 border-[#dce3da] bg-white shadow-[0_12px_28px_rgba(18,53,47,0.05)]"><CardContent className="p-0"><div className="flex flex-col gap-3 border-b border-[#e8eee8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="text-lg font-semibold text-[#173f3a]">Physical log timeline</h2><p className="mt-1 text-sm text-[#7d8a84]">Most recent entries across your facility.</p></div><div className="relative w-full sm:w-56"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#87958e]" /><Input value={query} onChange={e => setQuery(e.target.value)} className="h-10 border-[#ccd8cf] pl-9" placeholder="Search logs" /></div></div>
        {logs.isLoading ? <div className="p-6 text-sm text-[#7d8a84]">Loading physical logs…</div> : logs.data?.length ? <div>{logs.data.map(log => <div key={log.id} className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-[#eef1ee] px-5 py-4 sm:px-6"><span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${log.type === "count" ? "bg-[#4d8b59]" : log.type === "test_result" ? "bg-[#5795a0]" : "bg-[#d39424]"}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#203b35]">{log.productName}</p><p className="mt-1 text-xs text-[#7d8a84]">{new Date(log.occurredAt).toLocaleString()} {log.location ? `· ${log.location}` : ""}{log.reason ? ` · ${log.reason}` : ""}</p>{log.notes && <p className="mt-1 text-xs leading-5 text-[#61706b]">{log.notes}</p>}</div><div className="text-right"><StatusPill tone={log.type === "count" ? "green" : log.type === "test_result" ? "neutral" : "yellow"}>{log.type.replace("_", " ")}</StatusPill>{log.quantity !== null && <p className="mt-1.5 text-xs font-semibold text-[#52625d]">{log.quantity}</p>}</div></div>)}</div> : <div className="px-6 py-16 text-center"><AlertCircle className="mx-auto h-8 w-8 text-[#9daba4]" /><p className="mt-3 font-semibold text-[#173f3a]">No physical logs yet</p><p className="mt-1 text-sm text-[#7d8a84]">Entries saved from the form will appear here.</p></div>}</CardContent></Card></div>
  </div>;
}
