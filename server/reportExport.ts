import type { Express, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { sdk } from "./_core/sdk";
import * as db from "./db";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function asCsv(data: Awaited<ReturnType<typeof db.getReportData>>) {
  const header = ["Product", "SKU", "Metrc quantity", "Physical quantity", "Variance", "Variance %", "Severity", "Likely cause", "Resolution status", "Resolution notes"];
  const rows = data.lines.map(line => [line.productName, line.sku, line.metrcQuantity, line.physicalQuantity ?? "Not logged", line.varianceQuantity, line.variancePercent, line.severity, line.likelyCause, line.status, line.resolutionNotes]);
  return [
    ["MetrcMatch Reconciliation Report"],
    ["Facility", data.facility.name],
    ["License number", data.facility.licenseNumber ?? "Not provided"],
    ["Prepared by", data.report.preparedByName],
    ["Report period", `${data.report.startDate.toISOString().slice(0, 10)} to ${data.report.endDate.toISOString().slice(0, 10)}`],
    [],
    ["Summary", "Value"],
    ["Total items reconciled", data.report.totalItemsReconciled],
    ["Discrepancies found", data.report.discrepanciesFound],
    ["Discrepancies resolved", data.report.discrepanciesResolved],
    ["Outstanding discrepancies", data.report.outstandingDiscrepancies],
    [],
    header,
    ...rows,
  ].map(row => row.map(csvEscape).join(",")).join("\n");
}

function asPdf(res: Response, data: Awaited<ReturnType<typeof db.getReportData>>) {
  const document = new PDFDocument({ margin: 44, size: "LETTER" });
  document.pipe(res);
  document.fontSize(18).fillColor("#173f3a").text("MetrcMatch reconciliation report");
  document.moveDown(0.5).fontSize(10).fillColor("#1f2937");
  document.text(`Facility: ${data.facility.name}`);
  document.text(`License number: ${data.facility.licenseNumber ?? "Not provided"}`);
  document.text(`Period: ${data.report.startDate.toISOString().slice(0, 10)} – ${data.report.endDate.toISOString().slice(0, 10)}`);
  document.text(`Prepared by: ${data.report.preparedByName}`);
  document.moveDown().fontSize(13).fillColor("#173f3a").text("Reconciliation summary");
  document.fontSize(10).fillColor("#1f2937");
  [
    `Total items reconciled: ${data.report.totalItemsReconciled}`,
    `Discrepancies found: ${data.report.discrepanciesFound}`,
    `Resolved: ${data.report.discrepanciesResolved}`,
    `Outstanding: ${data.report.outstandingDiscrepancies}`,
    `Severity: ${data.report.criticalCount} Critical · ${data.report.highCount} High · ${data.report.mediumCount} Medium`,
  ].forEach(line => document.text(line));
  document.moveDown().fontSize(13).fillColor("#173f3a").text("Discrepancy detail");
  document.moveDown(0.25).fontSize(8).fillColor("#1f2937");
  if (!data.lines.length) document.text("No discrepancies were recorded in the selected period.");
  for (const line of data.lines) {
    const text = `${line.productName}${line.sku ? ` (${line.sku})` : ""}\nMetrc: ${line.metrcQuantity} | Physical: ${line.physicalQuantity ?? "Not logged"} | Variance: ${line.varianceQuantity} (${line.variancePercent}%) | ${line.severity.toUpperCase()}\nCause: ${line.likelyCause} | Status: ${line.status}${line.resolutionNotes ? ` | Notes: ${line.resolutionNotes}` : ""}`;
    if (document.y > 680) document.addPage();
    document.text(text, { width: 520 }).moveDown(0.65);
  }
  document.moveDown().fontSize(8).fillColor("#4b5563").text("MetrcMatch provides advisory reconciliation support. Facility staff remain responsible for verifying records and completing required reporting.");
  document.end();
}

export function registerReportExportRoutes(app: Express) {
  app.get("/api/reports/export", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) return res.status(403).json({ error: "User session required" });
      const reportId = Number(req.query.reportId);
      const format = req.query.format === "csv" ? "csv" : "pdf";
      if (!Number.isInteger(reportId) || reportId <= 0) return res.status(400).json({ error: "A valid reportId is required" });
      const facility = await db.ensureFacilityForUser(user.id);
      const data = await db.getReportData(facility.id, reportId);
      const fileBase = `metrcmatch-reconciliation-${data.report.createdAt.toISOString().slice(0, 10)}`;
      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileBase}.csv"`);
        return res.send(asCsv(data));
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileBase}.pdf"`);
      asPdf(res, data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Report export failed" });
    }
  });
}
