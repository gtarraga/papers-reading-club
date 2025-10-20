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
export async function processCycleRollover(
  secret: string | null | undefined
): Promise<{
  success: boolean;
  processedGroups?: number;
  error?: string;
}> {
  try {
    // Validate secret
    if (!secret || secret !== process.env.CRON_SECRET) {
      return {
        success: false,
        error: "Invalid secret key",
      };
    }

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
      const oneHour = 60 * 60 * 1000;

      // Only process if voting ended within the last hour (cron runs hourly)
      if (status === "completed" && timeSinceEnd <= oneHour) {
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

        // Create next cycle
        const nextCycleNumber = cycleData.cycleNumber + 1;
        const submissionStart = new Date(votingEnd);
        submissionStart.setDate(submissionStart.getDate() + 1); // Start next day

        const submissionEnd = new Date(submissionStart);
        submissionEnd.setDate(
          submissionEnd.getDate() + group.submissionDays - 1
        );

        const votingStart = new Date(submissionEnd);
        votingStart.setDate(votingStart.getDate() + 1);

        const nextVotingEnd = new Date(votingStart);
        nextVotingEnd.setDate(nextVotingEnd.getDate() + group.votingDays - 1);

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

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/admin");

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
