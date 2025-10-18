import { submissions } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Submission = InferSelectModel<typeof submissions>;
export type InsertSubmission = InferInsertModel<typeof submissions>;
