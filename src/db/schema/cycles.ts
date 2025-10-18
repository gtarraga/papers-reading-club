import { integer, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";

/**
 * Submission and voting cycles table
 * Each cycle has distinct submission and voting periods
 */
export const cycles = sqliteTable(
  "papers_cycles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
    cycleNumber: integer("cycle_number").notNull(), // Sequential cycle number within group
    submissionStart: integer("submission_start", {
      mode: "timestamp",
    }).notNull(),
    submissionEnd: integer("submission_end", { mode: "timestamp" }).notNull(),
    votingStart: integer("voting_start", { mode: "timestamp" }).notNull(),
    votingEnd: integer("voting_end", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    uniqueCycle: unique().on(table.groupId, table.cycleNumber),
  })
);
