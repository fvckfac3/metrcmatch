import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { discrepanciesRouter } from "./routers/discrepancies";
import { facilityRouter } from "./routers/facility";
import { logsRouter } from "./routers/logs";
import { metrcRouter } from "./routers/metrc";
import { reportsRouter } from "./routers/reports";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: -1,
      });
      return { success: true } as const;
    }),
  }),
  facility: facilityRouter,
  metrc: metrcRouter,
  logs: logsRouter,
  discrepancies: discrepanciesRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
