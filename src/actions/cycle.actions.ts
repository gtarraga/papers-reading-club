"use server";

import { db } from "@/db";
import {
  cycleResults,
  cycles,
  rankingRules,
  submissions,
  votes as votesTable,
} from "@/db/schema";
import type {
  Cycle,
  CycleStatus,
  Group,
  RankingRule,
  Submission,
} from "@/db/types";
import { getCurrentCycleWithStatus, getCycleStatus } from "@/lib/cycle";
import { calculateInstantRunoffWinner } from "@/lib/voting-algorithm";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Gets the current cycle data with status, submissions, and ranking rules
 *
 * @param groupId - The group ID
 * @returns Object with cycle, status, submissions, and ranking rules
 */
export async function getCurrentCycleData(groupId: Group["id"]): Promise<{
  cycle: Cycle | null;
  status: CycleStatus | null;
  submissions: Submission[];
  rankingRules: RankingRule[];
  error?: string;
}> {
  try {
    // Get current cycle with status
    const cycleWithStatus = await getCurrentCycleWithStatus(groupId);

    if (!cycleWithStatus) {
      return {
        cycle: null,
        status: null,
        submissions: [],
        rankingRules: [],
      };
    }

    const { cycle, status } = cycleWithStatus;

    // Fetch submissions with participant relations
    const submissionsList = await db.query.submissions.findMany({
      where: eq(submissions.cycleId, cycle.id),
      with: {
        participant: true,
      },
    });

    // Fetch ranking rules for the group
    const rankingRulesList = await db.query.rankingRules.findMany({
      where: eq(rankingRules.groupId, groupId),
      orderBy: (rankingRules, { asc }) => [asc(rankingRules.minPapers)],
    });

    return {
      cycle,
      status,
      submissions: submissionsList,
      rankingRules: rankingRulesList,
    };
  } catch (error) {
    console.error("Error fetching current cycle data:", error);
    return {
      cycle: null,
      status: null,
      submissions: [],
      rankingRules: [],
      error: "Failed to fetch cycle data",
    };
  }
}

/**
 * Processes cycle rollover for all groups
 * Called by cron job to automatically transition cycles
 *
 * @param secret - Secret key for authentication
 * @returns Object with success status and number of processed groups
 */
export async function processCycleRollover(): Promise<{
  success: boolean;
  processedGroups?: number;
  error?: string;
}> {
  try {
    // Fetch all groups
    const allGroups = await db.query.groups.findMany();

    let processedCount = 0;

    // Process each group
    for (const group of allGroups) {
      // Get the current cycle
      const cycleData = await db.query.cycles.findFirst({
        where: eq(cycles.groupId, group.id),
        orderBy: [desc(cycles.cycleNumber)],
      });

      if (!cycleData) {
        continue;
      }

      const status = getCycleStatus(cycleData);

      // Check if voting just ended
      const now = new Date();
      const votingEnd = new Date(cycleData.votingEnd);
      const timeSinceEnd = now.getTime() - votingEnd.getTime();
      const twoMinutes = 2 * 60 * 1000; // 2 minutes buffer for reliability

      // Only process if voting ended within the last 2 minutes (cron runs every minute)
      if (status === "completed" && timeSinceEnd <= twoMinutes) {
        // Check if next cycle already exists (prevents duplicate processing)
        const nextCycleExists = await db.query.cycles.findFirst({
          where: eq(cycles.cycleNumber, cycleData.cycleNumber + 1),
        });

        if (nextCycleExists) {
          // Already processed by client-side or previous cron run
          continue;
        }

        // Check if results already calculated
        const existingResult = await db.query.cycleResults.findFirst({
          where: eq(cycleResults.cycleId, cycleData.id),
        });

        if (!existingResult) {
          // Fetch votes with rankings
          const votes = await db.query.votes.findMany({
            where: eq(votesTable.cycleId, cycleData.id),
            with: {
              rankings: true,
            },
          });

          // Fetch submissions
          const submissionsList = await db.query.submissions.findMany({
            where: eq(submissions.cycleId, cycleData.id),
          });

          // Calculate winner
          const { winnerId, rounds } = calculateInstantRunoffWinner(
            votes,
            submissionsList
          );

          // Save results
          if (winnerId) {
            await db.insert(cycleResults).values({
              cycleId: cycleData.id,
              winningSubmissionId: winnerId,
              totalVotes: votes.length,
              eliminationRounds: rounds,
              calculatedAt: new Date(),
            });
          }
        }

        // Create next cycle - starts immediately after current cycle ends
        const nextCycleNumber = cycleData.cycleNumber + 1;
        const submissionStart = new Date(votingEnd);

        const submissionEnd = new Date(submissionStart);
        submissionEnd.setDate(submissionEnd.getDate() + group.submissionDays);

        const votingStart = new Date(submissionEnd);

        const nextVotingEnd = new Date(votingStart);
        nextVotingEnd.setDate(nextVotingEnd.getDate() + group.votingDays);

        // Insert next cycle
        await db.insert(cycles).values({
          groupId: group.id,
          cycleNumber: nextCycleNumber,
          submissionStart,
          submissionEnd,
          votingStart,
          votingEnd: nextVotingEnd,
          createdAt: new Date(),
        });

        processedCount++;
      }
    }

    return {
      success: true,
      processedGroups: processedCount,
    };
  } catch (error) {
    console.error("Error processing cycle rollover:", error);
    return {
      success: false,
      error: "Failed to process cycle rollover",
    };
  }
}

/**
 * Client-triggered cycle rollover
 * Called when a user is actively on the site and voting countdown ends
 * Includes revalidation for immediate UI update
 *
 * @returns Object with success status
 */
export async function triggerCycleRollover(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await processCycleRollover();

    if (
      result.success &&
      result.processedGroups &&
      result.processedGroups > 0
    ) {
      // Revalidate paths for immediate UI update
      revalidatePath("/");
      revalidatePath("/admin");
    }

    return result;
  } catch (error) {
    console.error("Error triggering cycle rollover:", error);
    return {
      success: false,
      error: "Failed to trigger cycle rollover",
    };
  }
}
