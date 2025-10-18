import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";

/**
 * Token validation patterns table
 * Defines regex patterns for validating participant tokens
 */
export const tokenPatterns = sqliteTable("papers_token_patterns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  pattern: text("pattern").notNull(), // e.g., "papers-*" converted to regex
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
