import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import * as db from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  exerciseLogs: router({
    list: protectedProcedure.query(({ ctx }) => db.listExerciseLogsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      workoutId: z.string().min(1).max(512),
      exerciseName: z.string().min(1).max(255),
      setNumber: z.number().int().positive(),
      repCount: z.number().int().positive(),
      weightUsedKg: z.number().min(0).max(1000).nullable().optional(),
    })).mutation(({ ctx, input }) => db.createExerciseLogForUser({ ...input, userId: ctx.user.id })),
  }),

  testerFeedback: router({
    submit: publicProcedure.input(z.object({
      category: z.enum(["bug", "idea", "content", "other"]),
      message: z.string().trim().min(8).max(2000),
      pageUrl: z.string().url().max(1024).optional(),
    })).mutation(({ input }) => db.createTesterFeedback(input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
