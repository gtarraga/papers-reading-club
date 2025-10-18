import { tokenPatterns } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type TokenPattern = InferSelectModel<typeof tokenPatterns>;
export type InsertTokenPattern = InferInsertModel<typeof tokenPatterns>;
