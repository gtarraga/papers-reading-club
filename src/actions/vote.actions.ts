"use server";

import { db } from "@/db";
import {
  cycles,
  rankingRules,
  submissions,
  voteRankings,
  votes,
} from "@/db/schema";
import type { Cycle, Group, Submission, Vote } from "@/db/types";
import { getOrCreateParticipant, validateToken } from "@/lib/auth";
import { getCycleStatus } from "@/lib/cycle";
import { voteSchema } from "@/lib/validations";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Submits a vote with ranked choices for submissions
 *
 * @param token - Participant token
 * @param cycleId - The cycle ID
 * @param groupId - The group ID
 * @param rankings - Array of submission rankings
 * @returns Object with success status and vote data
 */
export async function submitVote(
  token: string,
  cycleId: Cycle["id"],
  groupId: Group["id"],
  rankings: Array<{ submissionId: Submission["id"]; rank: number }>
): Promise<{
  success: boolean;
  vote?: Vote;
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

    // 3. Validate rankings with voteSchema
    const validated = voteSchema.safeParse({ rankings });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid vote data",
      };
    }

    // 4. Check cycle status (must be 'voting')
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
    if (status !== "voting") {
      return {
        success: false,
        error: "Voting is not currently open for this cycle",
      };
    }

    // 5. Check for existing vote (unique constraint)
    const existingVote = await db.query.votes.findFirst({
      where: and(
        eq(votes.cycleId, cycleId),
        eq(votes.participantId, participant.id)
      ),
    });

    if (existingVote) {
      return {
        success: false,
        error: "You have already voted in this cycle",
      };
    }

    // 6. Get ranking rules and validate rank count
    const rankingRulesList = await db.query.rankingRules.findMany({
      where: eq(rankingRules.groupId, groupId),
      orderBy: (rankingRules, { asc }) => [asc(rankingRules.minPapers)],
    });

    // Count submissions in this cycle
    const submissionsList = await db.query.submissions.findMany({
      where: eq(submissions.cycleId, cycleId),
    });

    const submissionCount = submissionsList.length;

    // Find applicable ranking rule
    const applicableRule = rankingRulesList
      .filter((rule) => submissionCount >= rule.minPapers)
      .sort((a, b) => b.minPapers - a.minPapers)[0];

    if (!applicableRule) {
      return {
        success: false,
        error: "No ranking rule found for current submission count",
      };
    }

    // Allow partial votes: at least 1, at most requiredRankings
    if (validated.data.rankings.length < 1) {
      return {
        success: false,
        error: "You must rank at least 1 paper",
      };
    }

    if (validated.data.rankings.length > applicableRule.requiredRankings) {
      return {
        success: false,
        error: `You can rank at most ${applicableRule.requiredRankings} paper(s)`,
      };
    }

    // Validate that all ranked submissions exist in this cycle
    const submissionIds = new Set(submissionsList.map((s) => s.id));
    for (const ranking of validated.data.rankings) {
      if (!submissionIds.has(ranking.submissionId)) {
        return {
          success: false,
          error: "Invalid submission ID in rankings",
        };
      }
    }

    // 7. Transaction: Insert vote and rankings
    const [newVote] = await db
      .insert(votes)
      .values({
        cycleId,
        participantId: participant.id,
        votedAt: new Date(),
      })
      .returning();

    // Insert all rankings
    await db.insert(voteRankings).values(
      validated.data.rankings.map((ranking) => ({
        voteId: newVote.id,
        submissionId: ranking.submissionId,
        rank: ranking.rank,
      }))
    );

    // 8. Revalidate papers page
    revalidatePath("/papers");

    return {
      success: true,
      vote: newVote,
    };
  } catch (error) {
    console.error("Error submitting vote:", error);
    return {
      success: false,
      error: "Failed to submit vote",
    };
  }
}
