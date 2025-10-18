import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cycles } from "./cycles";
import { submissions } from "./submissions";

/**
 * Cycle results table
 * Stores the winner and elimination rounds data for completed cycles
 */
export const cycleResults = sqliteTable("papers_cycle_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cycleId: integer("cycle_id")
    .notNull()
    .references(() => cycles.id)
    .unique(),
  winningSubmissionId: integer("winning_submission_id").references(
    () => submissions.id
  ),
  totalVotes: integer("total_votes").notNull(),
  eliminationRounds: text("elimination_rounds", { mode: "json" }),
  calculatedAt: integer("calculated_at", { mode: "timestamp" }).notNull(),
});
