import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import { runMetrcSync } from "./services";

export async function scheduledMetrcSync(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid)
      return res.status(403).json({ error: "cron-only" });
    const target = await db.getFacilityByScheduleTask(user.taskUid);
    if (!target) return res.json({ ok: true, skipped: "orphan" });
    const result = await runMetrcSync(target.facility.id, "scheduled");
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Scheduled sync failed",
      timestamp: new Date().toISOString(),
      context: { url: req.originalUrl },
    });
  }
}
