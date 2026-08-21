import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { discrepanciesRouter } from "./routers/discrepancies";
import { facilityRouter } from "./routers/facility";
import { logsRouter } from "./routers/logs";
import { metrcRouter } from "./routers/metrc";
import { reportsRouter } from "./routers/reports";
import { contactRequestsRouter } from "./routers/contactRequests";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts =>
      opts.ctx.user
        ? {
            ...opts.ctx.user,
            isOwner: opts.ctx.user.openId === ENV.ownerOpenId,
          }
        : null
    ),
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
  contactRequests: contactRequestsRouter,
});

export type AppRouter = typeof appRouter;
