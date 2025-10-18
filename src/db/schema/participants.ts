import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";

/**
 * Participants table
 * Auto-registered users identified by their tokens
 */
export const participants = sqliteTable(
  "papers_participants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
    token: text("token").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    registeredAt: integer("registered_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    uniqueToken: unique().on(table.groupId, table.token),
  })
);
