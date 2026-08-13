import { decimal, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Set-by-set home-workout records. This is intentionally isolated from the
 * existing Workouts recommendation module, which remains fully usable offline.
 */
export const exerciseLogs = mysqlTable("rootedfit_exercise_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workoutId: varchar("workoutId", { length: 512 }).notNull(),
  exerciseName: varchar("exerciseName", { length: 255 }).notNull(),
  setNumber: int("setNumber").notNull(),
  repCount: int("repCount").notNull(),
  weightUsedKg: decimal("weightUsedKg", { precision: 7, scale: 2 }),
  performedAt: timestamp("performedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = typeof exerciseLogs.$inferInsert;
