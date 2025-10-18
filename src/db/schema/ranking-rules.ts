import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";

/**
 * Dynamic ranking rules table
 * Defines how many papers participants must rank based on total submissions
 */
export const rankingRules = sqliteTable("papers_ranking_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  minPapers: integer("min_papers").notNull(), // Minimum papers in cycle
  maxPapers: integer("max_papers"), // Maximum papers (null = infinity)
  requiredRankings: integer("required_rankings").notNull(), // How many papers must be ranked
});
