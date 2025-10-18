import { integer, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { cycles } from "./cycles";
import { participants } from "./participants";

/**
 * Votes table
 * Each participant can vote once per cycle
 */
export const votes = sqliteTable(
  "papers_votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cycleId: integer("cycle_id")
      .notNull()
      .references(() => cycles.id),
    participantId: integer("participant_id")
      .notNull()
      .references(() => participants.id),
    votedAt: integer("voted_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    uniqueVote: unique().on(table.cycleId, table.participantId),
  })
);
