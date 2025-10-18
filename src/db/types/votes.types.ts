import { votes } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Vote = InferSelectModel<typeof votes>;
export type InsertVote = InferInsertModel<typeof votes>;
