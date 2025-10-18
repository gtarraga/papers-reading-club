import { participants } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Participant = InferSelectModel<typeof participants>;
export type InsertParticipant = InferInsertModel<typeof participants>;
