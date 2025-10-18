import { cycleResults } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type CycleResult = InferSelectModel<typeof cycleResults>;
export type InsertCycleResult = InferInsertModel<typeof cycleResults>;

/**
 * Represents a single elimination round in the instant-runoff voting algorithm
 */
export type EliminationRound = {
  roundNumber: number;
  eliminated?: number; // submissionId of eliminated paper (undefined if winner found)
  voteCounts: Record<number, number>; // submissionId -> vote count
  winner?: number; // submissionId of winner if found this round
};
