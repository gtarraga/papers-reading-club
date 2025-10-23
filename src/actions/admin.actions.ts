"use server";

import { db } from "@/db";
import {
  cycleResults,
  cycles,
  groups,
  submissions,
  votes as votesTable,
} from "@/db/schema";
import type { Cycle, Group } from "@/db/types";
import { getCurrentCycle, getCycleStatus } from "@/lib/cycle";
import { adminPasswordSchema } from "@/lib/validations";
import { calculateInstantRunoffWinner } from "@/lib/voting-algorithm";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Validates admin password
 */
function validateAdminPassword(password: string): boolean {
  const passwordValidation = adminPasswordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return false;
  }
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * Creates a new cycle for a group starting immediately
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param cadenceDays - Total cycle duration in days
 * @param votingDays - Voting period duration in days
 * @returns Object with success status and cycle data
 */
export async function startCycleNow(
  password: string,
  groupId: Group["id"],
  cadenceDays: number,
  votingDays: number
): Promise<{
  success: boolean;
  cycle?: Cycle;
  error?: string;
}> {
  try {
    if (!validateAdminPassword(password)) {
      return { success: false, error: "Invalid admin password" };
    }

    const submissionDays = cadenceDays - votingDays;
    if (submissionDays <= 0) {
      return {
        success: false,
        error: "Voting days must be less than total cadence days",
      };
    }

    // Start immediately
    const submissionStart = new Date();
    const submissionEnd = new Date(submissionStart);
    submissionEnd.setDate(submissionEnd.getDate() + submissionDays - 1);

    const votingStart = new Date(submissionEnd);
    votingStart.setDate(votingStart.getDate() + 1);

    const votingEnd = new Date(votingStart);
    votingEnd.setDate(votingEnd.getDate() + votingDays - 1);

    // Get latest cycle number
    const latestCycle = await db.query.cycles.findFirst({
      where: eq(cycles.groupId, groupId),
      orderBy: [desc(cycles.cycleNumber)],
    });

    const nextCycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

    // Insert new cycle
    const [newCycle] = await db
      .insert(cycles)
      .values({
        groupId,
        cycleNumber: nextCycleNumber,
        submissionStart,
        submissionEnd,
        votingStart,
        votingEnd,
        createdAt: new Date(),
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, cycle: newCycle };
  } catch (error) {
    console.error("Error starting cycle:", error);
    return { success: false, error: "Failed to start new cycle" };
  }
}

/**
 * Schedules a new cycle for a group with custom start date
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param startDate - When the cycle should start
 * @param cadenceDays - Total cycle duration in days
 * @param votingDays - Voting period duration in days
 * @returns Object with success status and cycle data
 */
export async function scheduleCycle(
  password: string,
  groupId: Group["id"],
  startDate: Date,
  cadenceDays: number,
  votingDays: number
): Promise<{
  success: boolean;
  cycle?: Cycle;
  error?: string;
}> {
  try {
    if (!validateAdminPassword(password)) {
      return { success: false, error: "Invalid admin password" };
    }

    const submissionDays = cadenceDays - votingDays;
    if (submissionDays <= 0) {
      return {
        success: false,
        error: "Voting days must be less than total cadence days",
      };
    }

    const submissionStart = new Date(startDate);
    const submissionEnd = new Date(submissionStart);
    submissionEnd.setDate(submissionEnd.getDate() + submissionDays - 1);

    const votingStart = new Date(submissionEnd);
    votingStart.setDate(votingStart.getDate() + 1);

    const votingEnd = new Date(votingStart);
    votingEnd.setDate(votingEnd.getDate() + votingDays - 1);

    // Get latest cycle number
    const latestCycle = await db.query.cycles.findFirst({
      where: eq(cycles.groupId, groupId),
      orderBy: [desc(cycles.cycleNumber)],
    });

    const nextCycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

    // Insert new cycle
    const [newCycle] = await db
      .insert(cycles)
      .values({
        groupId,
        cycleNumber: nextCycleNumber,
        submissionStart,
        submissionEnd,
        votingStart,
        votingEnd,
        createdAt: new Date(),
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, cycle: newCycle };
  } catch (error) {
    console.error("Error scheduling cycle:", error);
    return { success: false, error: "Failed to schedule cycle" };
  }
}

/**
 * Finishes the current voting period and starts the next cycle immediately
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param cadenceDays - Total cycle duration in days for next cycle
 * @param votingDays - Voting period duration in days for next cycle
 * @returns Object with success status
 */
export async function finishVoteAndStartNext(
  password: string,
  groupId: Group["id"],
  cadenceDays: number,
  votingDays: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!validateAdminPassword(password)) {
      return { success: false, error: "Invalid admin password" };
    }

    // Get current cycle
    const currentCycle = await getCurrentCycle(groupId);
    if (!currentCycle) {
      return { success: false, error: "No active cycle found" };
    }

    const status = getCycleStatus(currentCycle);
    if (status !== "voting") {
      return {
        success: false,
        error: "Current cycle is not in voting phase",
      };
    }

    // Calculate results for current cycle
    const votes = await db.query.votes.findMany({
      where: eq(votesTable.cycleId, currentCycle.id),
      with: { rankings: true },
    });

    const submissionsList = await db.query.submissions.findMany({
      where: eq(submissions.cycleId, currentCycle.id),
    });

    const { winnerId, rounds } = calculateInstantRunoffWinner(
      votes,
      submissionsList
    );

    // Save results
    if (winnerId) {
      await db.insert(cycleResults).values({
        cycleId: currentCycle.id,
        winningSubmissionId: winnerId,
        totalVotes: votes.length,
        eliminationRounds: rounds,
        calculatedAt: new Date(),
      });
    }

    // Force end current voting period
    await db
      .update(cycles)
      .set({ votingEnd: new Date() })
      .where(eq(cycles.id, currentCycle.id));

    // Start next cycle immediately
    const result = await startCycleNow(
      password,
      groupId,
      cadenceDays,
      votingDays
    );

    revalidatePath("/");
    revalidatePath("/admin");

    return result;
  } catch (error) {
    console.error("Error finishing vote and starting next cycle:", error);
    return {
      success: false,
      error: "Failed to finish vote and start next cycle",
    };
  }
}

/**
 * Finishes the current voting period without creating a new cycle
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @returns Object with success status
 */
export async function finishVoteAndPause(
  password: string,
  groupId: Group["id"]
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!validateAdminPassword(password)) {
      return { success: false, error: "Invalid admin password" };
    }

    // Get current cycle
    const currentCycle = await getCurrentCycle(groupId);
    if (!currentCycle) {
      return { success: false, error: "No active cycle found" };
    }

    const status = getCycleStatus(currentCycle);
    if (status !== "voting") {
      return {
        success: false,
        error: "Current cycle is not in voting phase",
      };
    }

    // Calculate results for current cycle
    const votes = await db.query.votes.findMany({
      where: eq(votesTable.cycleId, currentCycle.id),
      with: { rankings: true },
    });

    const submissionsList = await db.query.submissions.findMany({
      where: eq(submissions.cycleId, currentCycle.id),
    });

    const { winnerId, rounds } = calculateInstantRunoffWinner(
      votes,
      submissionsList
    );

    // Save results
    if (winnerId) {
      await db.insert(cycleResults).values({
        cycleId: currentCycle.id,
        winningSubmissionId: winnerId,
        totalVotes: votes.length,
        eliminationRounds: rounds,
        calculatedAt: new Date(),
      });
    }

    // Force end current voting period
    await db
      .update(cycles)
      .set({ votingEnd: new Date() })
      .where(eq(cycles.id, currentCycle.id));

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error finishing vote and pausing:", error);
    return { success: false, error: "Failed to finish vote and pause" };
  }
}

/**
 * Updates the default cycle settings for a group
 * These settings will be used for all future automatically-created cycles
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param cadenceDays - Total cycle duration in days
 * @param votingDays - Voting period duration in days
 * @returns Object with success status
 */
export async function updateGroupCycleSettings(
  password: string,
  groupId: Group["id"],
  cadenceDays: number,
  votingDays: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!validateAdminPassword(password)) {
      return { success: false, error: "Invalid admin password" };
    }

    const submissionDays = cadenceDays - votingDays;
    if (submissionDays <= 0) {
      return {
        success: false,
        error: "Voting days must be less than total cadence days",
      };
    }

    // Update group settings
    await db
      .update(groups)
      .set({
        cadenceDays,
        submissionDays,
        votingDays,
      })
      .where(eq(groups.id, groupId));

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error updating group cycle settings:", error);
    return { success: false, error: "Failed to update cycle settings" };
  }
}
