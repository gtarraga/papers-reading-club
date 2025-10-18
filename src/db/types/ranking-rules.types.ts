import { rankingRules } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type RankingRule = InferSelectModel<typeof rankingRules>;
export type InsertRankingRule = InferInsertModel<typeof rankingRules>;
