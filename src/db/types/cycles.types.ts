import { cycles } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Cycle = InferSelectModel<typeof cycles>;
export type InsertCycle = InferInsertModel<typeof cycles>;

/**
 * Cycle status based on current time relative to cycle dates
 */
export type CycleStatus = "submission" | "voting" | "completed" | "pending";
