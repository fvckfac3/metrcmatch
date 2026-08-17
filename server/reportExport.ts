import type { Express, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { z } from "zod";
import * as db from "./db";
import {
  ApiError,
  requireEntitledFacilityContext,
  sendRouteError,
} from "./http";

const generateQuerySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must use YYYY-MM-DD"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must use YYYY-MM-DD"),
  format: z.enum(["pdf", "csv"]),
});

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start > end
  )
    throw new ApiError(
      400,
      "start_date must be on or before end_date.",
      "VALIDATION_ERROR"
    );
  return { start, end };
}

export function asCsv(data: Awaited<ReturnType<typeof db.getReportData>>) {
  const header = [
    "Product",
    "SKU",
    "Metrc quantity",
    "Physical quantity",
    "Variance",
    "Variance %",
    "Severity",
    "Likely cause",
    "Resolution status",
    "Resolution notes",
    "Detected at",
  ];
  const rows = data.lines.map(line => [
    line.productName,
    line.sku,
    line.metrcQuantity,
    line.physicalQuantity ?? "Not logged",
    line.varianceQuantity,
    line.variancePercent,
    line.severity,
    line.likelyCause,
    line.status,
    line.resolutionNotes,
    line.detectedAt.toISOString(),
  ]);
  return [
    ["MetrcMatch Reconciliation Report"],
    ["Facility", data.facility.name],
    ["License number", data.facility.licenseNumber ?? "Not provided"],
    ["Prepared by", data.report.preparedByName],
    [
      "Report period",
      `${data.report.startDate.toISOString().slice(0, 10)} to ${data.report.endDate.toISOString().slice(0, 10)}`,
    ],
    [],
    ["Summary", "Value"],
    ["Total items", data.report.totalItemsReconciled],
    ["Discrepancies found", data.report.discrepanciesFound],
    ["Discrepancies resolved", data.report.discrepanciesResolved],
    ["Outstanding discrepancies", data.report.outstandingDiscrepancies],
    ["Critical", data.report.criticalCount],
    ["High", data.report.highCount],
    ["Medium", data.report.mediumCount],
    [],
    header,
    ...rows,
  ]
    .map(row => row.map(csvEscape).join(","))
    .join("\n");
}

export function asPdf(
  res: Response,
  data: Awaited<ReturnType<typeof db.getReportData>>
) {
  const document = new PDFDocument({ margin: 44, size: "LETTER" });
  document.pipe(res);
  document
    .fontSize(18)
    .fillColor("#173f3a")
    .text("MetrcMatch reconciliation report");
  document.moveDown(0.5).fontSize(10).fillColor("#1f2937");
  document.text(`Facility: ${data.facility.name}`);
  document.text(
    `License number: ${data.facility.licenseNumber ?? "Not provided"}`
  );
  document.text(
    `Period: ${data.report.startDate.toISOString().slice(0, 10)} – ${data.report.endDate.toISOString().slice(0, 10)}`
  );
  document.text(`Prepared by: ${data.report.preparedByName}`);
  document
    .moveDown()
    .fontSize(13)
    .fillColor("#173f3a")
    .text("Reconciliation summary");
  document.fontSize(10).fillColor("#1f2937");
  [
    `Total items: ${data.report.totalItemsReconciled}`,
    `Discrepancies found: ${data.report.discrepanciesFound}`,
    `Discrepancies resolved: ${data.report.discrepanciesResolved}`,
    `Outstanding: ${data.report.outstandingDiscrepancies}`,
    `Severity: ${data.report.criticalCount} Critical · ${data.report.highCount} High · ${data.report.mediumCount} Medium`,
  ].forEach(line => document.text(line));
  document
    .moveDown()
    .fontSize(13)
    .fillColor("#173f3a")
    .text("Discrepancy line items");
  document.moveDown(0.25).fontSize(8).fillColor("#1f2937");
  if (!data.lines.length)
    document.text("No discrepancies were recorded in the selected period.");
  for (const line of data.lines) {
    const text = `${line.productName}${line.sku ? ` (${line.sku})` : ""}\nMetrc: ${line.metrcQuantity} | Physical: ${line.physicalQuantity ?? "Not logged"} | Variance: ${line.varianceQuantity} (${line.variancePercent}%) | ${line.severity.toUpperCase()}\nCause: ${line.likelyCause} | Status: ${line.status}${line.resolutionNotes ? ` | Notes: ${line.resolutionNotes}` : ""}`;
    if (document.y > 680) document.addPage();
    document.text(text, { width: 520 }).moveDown(0.65);
  }
  document
    .moveDown()
    .fontSize(8)
    .fillColor("#4b5563")
    .text(
      "MetrcMatch provides advisory reconciliation support. Facility staff remain responsible for verifying records and completing required reporting."
    );
  document.end();
}

function sendReport(
  res: Response,
  data: Awaited<ReturnType<typeof db.getReportData>>,
  format: "pdf" | "csv"
) {
  const fileBase = `metrcmatch-reconciliation-${data.report.startDate.toISOString().slice(0, 10)}-${data.report.endDate.toISOString().slice(0, 10)}`;
  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileBase}.csv"`
    );
    return res.send(asCsv(data));
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileBase}.pdf"`
  );
  asPdf(res, data);
}

export function registerReportExportRoutes(app: Express) {
  app.get("/api/reports/generate", async (req, res) => {
    try {
      const { user, facility } = await requireEntitledFacilityContext(
        req,
        "User session required"
      );
      const input = generateQuerySchema.parse({
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        format: req.query.format,
      });
      const { start, end } = parseDateRange(input.start_date, input.end_date);
      const reportId = await db.createReport(facility.id, user, start, end);
      const data = await db.getReportData(facility.id, reportId);
      return sendReport(res, data, input.format);
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Report generation",
        fallback: "Report generation failed.",
        validationMessage:
          "start_date, end_date, and format=pdf|csv are required.",
      });
    }
  });

  app.get("/api/reports/export", async (req: Request, res: Response) => {
    try {
      const { facility } = await requireEntitledFacilityContext(
        req,
        "User session required"
      );
      const reportId = Number(req.query.reportId);
      const format = req.query.format === "csv" ? "csv" : "pdf";
      if (!Number.isInteger(reportId) || reportId <= 0)
        return res.status(400).json({
          error: "A valid reportId is required",
          code: "VALIDATION_ERROR",
        });
      const data = await db.getReportData(facility.id, reportId);
      return sendReport(res, data, format);
    } catch (error) {
      return sendRouteError(res, error, {
        scope: "Report export",
        fallback: "Report export failed.",
      });
    }
  });
}
