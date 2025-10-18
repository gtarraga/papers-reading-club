"use server";

import { db } from "@/db";
import { cycles, submissions } from "@/db/schema";
import type { Cycle, Group, Submission } from "@/db/types";
import { getOrCreateParticipant, validateToken } from "@/lib/auth";
import { getCycleStatus } from "@/lib/cycle";
import { submissionSchema } from "@/lib/validations";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Submits a paper for the current cycle
 *
 * @param token - Participant token
 * @param cycleId - The cycle ID
 * @param groupId - The group ID
 * @param data - Form data with submission details
 * @returns Object with success status and submission data
 */
export async function submitPaper(
  token: string,
  cycleId: Cycle["id"],
  groupId: Group["id"],
  data: FormData
): Promise<{
  success: boolean;
  submission?: Submission;
  error?: string;
}> {
  try {
    // 1. Validate token
    const isValid = await validateToken(token, groupId);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid token",
      };
    }

    // 2. Get participant
    const participant = await getOrCreateParticipant(token, groupId);
    if (!participant) {
      return {
        success: false,
        error: "Could not get participant",
      };
    }

    // 3. Parse FormData into submission object
    const title = data.get("title") as string;
    const url = data.get("url") as string;
    const publicationDateStr = data.get("publicationDate") as string;
    const recommendation = data.get("recommendation") as string;

    const submissionData = {
      title,
      url,
      publicationDate: publicationDateStr
        ? new Date(publicationDateStr)
        : undefined,
      recommendation: recommendation || undefined,
    };

    // 4. Validate with submissionSchema
    const validated = submissionSchema.safeParse(submissionData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid submission data",
      };
    }

    // 5. Check cycle status (must be 'submission')
    const cycle = await db.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
    });

    if (!cycle) {
      return {
        success: false,
        error: "Cycle not found",
      };
    }

    const status = getCycleStatus(cycle);
    if (status !== "submission") {
      return {
        success: false,
        error: "Submissions are not currently open for this cycle",
      };
    }

    // 6. Check submission limit per user
    const existingSubmissions = await db.query.submissions.findMany({
      where: and(
        eq(submissions.cycleId, cycleId),
        eq(submissions.participantId, participant.id)
      ),
    });

    // Default limit: 1 submission per participant per cycle
    const maxSubmissions = 1;
    if (existingSubmissions.length >= maxSubmissions) {
      return {
        success: false,
        error: `You have reached the maximum of ${maxSubmissions} submission(s) per cycle`,
      };
    }

    // 7. Insert into submissions table
    const [newSubmission] = await db
      .insert(submissions)
      .values({
        cycleId,
        participantId: participant.id,
        title: validated.data.title,
        url: validated.data.url,
        publicationDate: validated.data.publicationDate || null,
        recommendation: validated.data.recommendation || null,
        submittedAt: new Date(),
      })
      .returning();

    // 8. Revalidate papers page
    revalidatePath("/papers");

    return {
      success: true,
      submission: newSubmission,
    };
  } catch (error) {
    console.error("Error submitting paper:", error);
    return {
      success: false,
      error: "Failed to submit paper",
    };
  }
}

/**
 * Deletes a submission
 * Only the owner can delete their submission
 *
 * @param token - Participant token
 * @param submissionId - The submission ID to delete
 * @param groupId - The group ID
 * @returns Object with success status
 */
export async function deleteSubmission(
  token: string,
  submissionId: Submission["id"],
  groupId: Group["id"]
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. Validate token
    const isValid = await validateToken(token, groupId);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid token",
      };
    }

    // 2. Get participant
    const participant = await getOrCreateParticipant(token, groupId);
    if (!participant) {
      return {
        success: false,
        error: "Could not get participant",
      };
    }

    // 3. Fetch submission
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });

    if (!submission) {
      return {
        success: false,
        error: "Submission not found",
      };
    }

    // 4. Verify ownership
    if (submission.participantId !== participant.id) {
      return {
        success: false,
        error: "You can only delete your own submissions",
      };
    }

    // 5. Delete submission
    await db.delete(submissions).where(eq(submissions.id, submissionId));

    // 6. Revalidate papers page
    revalidatePath("/papers");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting submission:", error);
    return {
      success: false,
      error: "Failed to delete submission",
    };
  }
}
