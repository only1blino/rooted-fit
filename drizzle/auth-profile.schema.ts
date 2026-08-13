import { boolean, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Optional credential metadata for a future authenticated RootedFit account.
 * Password hashes, never plaintext passwords, may be stored when a credential
 * provider is introduced. The local-first MVP does not write to this table.
 */
export const rootedFitUserCredentials = mysqlTable("rootedfit_user_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const rootedFitProfileCredentials = mysqlTable("rootedfit_profile_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  profileVersion: varchar("profileVersion", { length: 32 }).default("v1").notNull(),
  consentVersion: varchar("consentVersion", { length: 32 }),
  localDataPreference: boolean("localDataPreference").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RootedFitUserCredential = typeof rootedFitUserCredentials.$inferSelect;
export type InsertRootedFitUserCredential = typeof rootedFitUserCredentials.$inferInsert;
export type RootedFitProfileCredential = typeof rootedFitProfileCredentials.$inferSelect;
export type InsertRootedFitProfileCredential = typeof rootedFitProfileCredentials.$inferInsert;
