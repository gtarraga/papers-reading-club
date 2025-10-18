import { voteRankings } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type VoteRanking = InferSelectModel<typeof voteRankings>;
export type InsertVoteRanking = InferInsertModel<typeof voteRankings>;
