import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { exerciseLogs } from "../drizzle/exercise-logs.schema";
import { rootedFitTesterFeedback } from "../drizzle/tester-feedback.schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listExerciseLogsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exerciseLogs).where(eq(exerciseLogs.userId, userId)).orderBy(desc(exerciseLogs.performedAt)).limit(100);
}

export async function createExerciseLogForUser(input: { userId: number; workoutId: string; exerciseName: string; setNumber: number; repCount: number; weightUsedKg?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for exercise-log sync");
  await db.insert(exerciseLogs).values({
    userId: input.userId,
    workoutId: input.workoutId,
    exerciseName: input.exerciseName,
    setNumber: input.setNumber,
    repCount: input.repCount,
    weightUsedKg: input.weightUsedKg === null || input.weightUsedKg === undefined ? null : input.weightUsedKg.toFixed(2),
  });
  return { success: true } as const;
}

export async function createTesterFeedback(input: { category: string; message: string; pageUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Feedback is temporarily unavailable");
  await db.insert(rootedFitTesterFeedback).values({
    category: input.category,
    message: input.message,
    pageUrl: input.pageUrl || null,
  });
  return { success: true } as const;
}

// TODO: add feature queries here as your schema grows.
