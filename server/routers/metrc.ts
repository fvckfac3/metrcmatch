import { parse as parseCookie } from "cookie";
import { z } from "zod";
import { COOKIE_NAME } from "../../shared/const";
import { createHeartbeatJob, deleteHeartbeatJob } from "../_core/heartbeat";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { runMetrcSync, testConnectionForFacility } from "../services";

const settingsInput = z.object({
  authMethod: z.enum(["api_key", "oauth"]),
  apiBaseUrl: z.string().url().max(500),
  licenseNumber: z.string().trim().min(2).max(100),
  userApiKey: z.string().trim().min(1).max(500).optional(),
  integratorApiKey: z.string().trim().min(1).max(500).optional(),
  oauthClientId: z.string().trim().min(1).max(500).optional(),
  oauthClientSecret: z.string().trim().min(1).max(500).optional(),
});

export const metrcRouter = router({
  settings: protectedProcedure.query(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    const connection = await db.getMetrcConnection(facility.id);
    return connection
      ? {
          authMethod: connection.authMethod,
          apiBaseUrl: connection.apiBaseUrl,
          licenseNumber: connection.licenseNumber,
          connectionStatus: connection.connectionStatus,
          lastTestedAt: connection.lastTestedAt,
          lastSyncedAt: connection.lastSyncedAt,
          hasUserApiKey: Boolean(connection.encryptedUserApiKey),
          hasIntegratorApiKey: Boolean(connection.encryptedIntegratorApiKey),
          hasOauthClientId: Boolean(connection.encryptedOauthClientId),
          hasOauthClientSecret: Boolean(connection.encryptedOauthClientSecret),
          scheduleCronTaskUid: connection.scheduleCronTaskUid,
        }
      : null;
  }),
  saveSettings: protectedProcedure
    .input(settingsInput)
    .mutation(async ({ ctx, input }) => {
      const facility = await db.ensureFacilityForUser(ctx.user.id);
      await db.saveMetrcConnection(facility.id, input);
      return { success: true };
    }),
  test: protectedProcedure.mutation(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    return testConnectionForFacility(facility.id);
  }),
  syncNow: protectedProcedure.mutation(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    return runMetrcSync(facility.id, "manual");
  }),
  history: protectedProcedure.query(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    return db.listSyncs(facility.id);
  }),
  scheduleNightly: protectedProcedure
    .input(
      z.object({
        cron: z
          .string()
          .regex(
            /^\d+ \d+ \d+ \* \* \*$/,
            "Use a six-field UTC daily cron expression."
          ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const facility = await db.ensureFacilityForUser(ctx.user.id);
      const connection = await db.getMetrcConnection(facility.id);
      if (!connection)
        throw new Error(
          "Configure the Metrc connection before scheduling a sync."
        );
      if (connection.scheduleCronTaskUid)
        throw new Error(
          "A scheduled sync is already configured for this facility."
        );
      const sessionToken =
        parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const job = await createHeartbeatJob(
        {
          name: `metrcmatch-facility-${facility.id}-sync`,
          cron: input.cron,
          path: "/api/scheduled/metrc-sync",
          payload: { facilityId: facility.id },
          description: `Nightly Metrc reconciliation sync for ${facility.name}`,
        },
        sessionToken
      );
      await db.setScheduleTask(facility.id, job.taskUid);
      return job;
    }),
  disableSchedule: protectedProcedure.mutation(async ({ ctx }) => {
    const facility = await db.ensureFacilityForUser(ctx.user.id);
    const connection = await db.getMetrcConnection(facility.id);
    if (!connection?.scheduleCronTaskUid) return { success: true };
    const sessionToken =
      parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    await deleteHeartbeatJob(connection.scheduleCronTaskUid, sessionToken);
    await db.setScheduleTask(facility.id, null);
    return { success: true };
  }),
});
