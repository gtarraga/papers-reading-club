import { groups } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Group = InferSelectModel<typeof groups>;
export type InsertGroup = InferInsertModel<typeof groups>;
