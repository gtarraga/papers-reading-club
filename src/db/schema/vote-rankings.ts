import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { submissions } from "./submissions";
import { votes } from "./votes";

/**
 * Vote rankings table
 * Individual paper rankings within each vote (1 = first choice, 2 = second, etc.)
 */
export const voteRankings = sqliteTable("papers_vote_rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voteId: integer("vote_id")
    .notNull()
    .references(() => votes.id),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => submissions.id),
  rank: integer("rank").notNull(), // 1 = first choice, 2 = second, etc.
});
