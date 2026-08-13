import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Public browser-tester feedback. No account or health-plan data is required. */
export const rootedFitTesterFeedback = mysqlTable("rootedfit_tester_feedback", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 32 }).notNull(),
  message: text("message").notNull(),
  pageUrl: varchar("pageUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RootedFitTesterFeedback = typeof rootedFitTesterFeedback.$inferSelect;
export type InsertRootedFitTesterFeedback = typeof rootedFitTesterFeedback.$inferInsert;
