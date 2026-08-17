import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reports() {
  const [startDate, setStartDate] = useState(() => { const value = new Date(); value.setDate(value.getDate() - 30); return value.toISOString().slice(0, 10); });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportId, setReportId] = useState<number | null>(null);
  const generate = trpc.reports.generate.useMutation({ onSuccess: data => { setReportId(data.reportId); toast.success("Reconciliation report prepared."); }, onError: error => toast.error(error.message) });
  const download = (format: "pdf" | "csv") => {
    if (!reportId) return toast.error("Generate the report before exporting it.");
    window.open(`/api/reports/export?reportId=${reportId}&format=${format}`, "_blank", "noopener,noreferrer");
  };
  return <div className="motion-rise mx-auto max-w-5xl space-y-6"><div><p className="text-sm font-semibold text-[#356e45]">Reconciliation record</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#173f3a]">Reports</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f7d77]">Create a clear, facility-specific summary for internal review or an inspection request.</p></div>
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="surface-lift motion-rise motion-delay-1 border-[#dce3da] bg-white shadow-[0_12px_28px_rgba(18,53,47,0.05)]"><CardContent className="p-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#dfeee0] text-[#205b35]"><FileText className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-semibold text-[#173f3a]">Generate reconciliation report</h2><p className="mt-2 text-sm leading-6 text-[#6f7d77]">Includes period, facility metadata, preparer, severity summary, and detailed discrepancy lines.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="report-start">Start date</Label><Input id="report-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 border-[#ccd8cf]" /></div><div className="space-y-2"><Label htmlFor="report-end">End date</Label><Input id="report-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11 border-[#ccd8cf]" /></div></div><Button onClick={() => generate.mutate({ startDate: new Date(`${startDate}T00:00:00`), endDate: new Date(`${endDate}T23:59:59`) })} disabled={generate.isPending} className="mt-6 h-12 w-full bg-[#173f3a] hover:bg-[#0e2f2b]"><FileText className="mr-2 h-4 w-4" />{generate.isPending ? "Preparing…" : "Prepare report"}</Button></CardContent></Card>
      <Card className="surface-lift motion-rise motion-delay-2 relative overflow-hidden border-[#dce3da] bg-[#173f3a] text-white shadow-[0_18px_55px_rgba(18,53,47,0.14)]"><CardContent className="relative z-10 p-6"><div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#a9d8ae]/20 shadow-[0_0_0_20px_rgba(169,216,174,0.04)]" /><ShieldCheck className="h-6 w-6 text-[#a9d8ae]" /><h2 className="mt-5 text-xl font-semibold">Export-ready summary</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#d8e6d8]">MetrcMatch formats the report for readability. It remains an advisory workpaper; facility personnel should verify it before relying on it for compliance purposes.</p>{!reportId && <div className="mt-6 rounded-xl border border-[#719f7a]/40 bg-[#27524c]/50 p-3 text-sm leading-5 text-[#d8e6d8]">Prepare a report to unlock the PDF and CSV exports.</div>}<div className="mt-8 grid gap-3 sm:grid-cols-2"><Button onClick={() => download("pdf")} disabled={!reportId} className="h-12 bg-white text-[#173f3a] hover:bg-[#e8f1e7]"><Download className="mr-2 h-4 w-4" />Export PDF</Button><Button onClick={() => download("csv")} disabled={!reportId} variant="outline" className="h-12 border-[#719f7a] bg-transparent text-white hover:bg-[#27524c] hover:text-white"><FileSpreadsheet className="mr-2 h-4 w-4" />Export CSV</Button></div>{reportId && <p className="mt-4 text-xs text-[#c1d9c2]">Report #{reportId} is ready for download.</p>}</CardContent></Card></div>
  </div>;
}
