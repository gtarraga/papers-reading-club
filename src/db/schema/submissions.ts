import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cycles } from "./cycles";
import { participants } from "./participants";

/**
 * Paper submissions table
 * Each participant can submit papers during the submission phase
 */
export const submissions = sqliteTable("papers_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cycleId: integer("cycle_id")
    .notNull()
    .references(() => cycles.id),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publicationDate: integer("publication_date", { mode: "timestamp" }),
  recommendation: text("recommendation"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull(),
});
