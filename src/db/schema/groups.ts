import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Reading groups configuration table
 * Defines the structure and cadence for paper reading clubs
 */
export const groups = sqliteTable("papers_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  cadenceDays: integer("cadence_days").notNull(), // Total cycle length (e.g., 14 for bi-weekly)
  submissionDays: integer("submission_days").notNull(), // Days allocated for submission phase
  votingDays: integer("voting_days").notNull(), // Days allocated for voting phase
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
