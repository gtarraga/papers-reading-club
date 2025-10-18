import { db } from "@/db";
import { cycles } from "@/db/schema";
import type { Cycle, CycleStatus, Group } from "@/db/types";
import { and, eq, gte, lte } from "drizzle-orm";

/**
 * Gets the current active cycle for a group
 * A cycle is active if the current date is between submissionStart and votingEnd
 *
 * @param groupId - The group ID
 * @returns The current cycle or null if no active cycle
 */
export async function getCurrentCycle(
  groupId: Group["id"]
): Promise<Cycle | null> {
  const now = new Date();

  // Find cycle where current time is between submissionStart and votingEnd
  const cycle = await db.query.cycles.findFirst({
    where: and(
      eq(cycles.groupId, groupId),
      lte(cycles.submissionStart, now),
      gte(cycles.votingEnd, now)
    ),
    orderBy: (cycles, { desc }) => [desc(cycles.cycleNumber)],
  });

  return cycle || null;
}

/**
 * Determines the status of a cycle based on current time
 *
 * @param cycle - The cycle to check
 * @returns The cycle status: 'pending', 'submission', 'voting', or 'completed'
 */
export function getCycleStatus(cycle: Cycle): CycleStatus {
  const now = new Date();
  const submissionStart = new Date(cycle.submissionStart);
  const submissionEnd = new Date(cycle.submissionEnd);
  const votingStart = new Date(cycle.votingStart);
  const votingEnd = new Date(cycle.votingEnd);

  // Pending: submission hasn't started yet
  if (now < submissionStart) {
    return "pending";
  }

  // Submission phase: between submissionStart and submissionEnd
  if (now >= submissionStart && now < submissionEnd) {
    return "submission";
  }

  // Voting phase: between votingStart and votingEnd
  if (now >= votingStart && now < votingEnd) {
    return "voting";
  }

  // Completed: voting has ended
  return "completed";
}

/**
 * Gets the current cycle with its status
 * Convenience function combining getCurrentCycle and getCycleStatus
 *
 * @param groupId - The group ID
 * @returns Object with cycle and status, or null if no active cycle
 */
export async function getCurrentCycleWithStatus(
  groupId: Group["id"]
): Promise<{ cycle: Cycle; status: CycleStatus } | null> {
  const cycle = await getCurrentCycle(groupId);

  if (!cycle) {
    return null;
  }

  const status = getCycleStatus(cycle);

  return { cycle, status };
}
