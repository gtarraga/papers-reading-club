"use server";

import { db } from "@/db";
import { cycles } from "@/db/schema";
import type { Cycle, Group, InsertGroup } from "@/db/types";
import { adminPasswordSchema } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Creates a new cycle for a group
 * Admin-only action requiring password validation
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param submissionStart - Start date for submission phase
 * @param submissionEnd - End date for submission phase
 * @param votingEnd - End date for voting phase
 * @returns Object with success status and cycle data
 */
export async function createNewCycle(
  password: string,
  groupId: Group["id"],
  submissionStart: Date,
  submissionEnd: Date,
  votingEnd: Date
): Promise<{
  success: boolean;
  cycle?: Cycle;
  error?: string;
}> {
  try {
    // 1. Validate password with adminPasswordSchema
    const passwordValidation = adminPasswordSchema.safeParse(password);
    if (!passwordValidation.success) {
      return {
        success: false,
        error: "Invalid password format",
      };
    }

    // 2. Compare with environment variable
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid admin password",
      };
    }

    // 3. Get latest cycle number for group
    const latestCycle = await db.query.cycles.findFirst({
      where: eq(cycles.groupId, groupId),
      orderBy: [desc(cycles.cycleNumber)],
    });

    // 4. Calculate next cycle number
    const nextCycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

    // Calculate voting start (day after submission ends)
    const votingStart = new Date(submissionEnd);
    votingStart.setDate(votingStart.getDate() + 1);

    // 5. Insert new cycle
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

    // 6. Revalidate paths
    revalidatePath("/papers");
    revalidatePath("/admin");

    return {
      success: true,
      cycle: newCycle,
    };
  } catch (error) {
    console.error("Error creating new cycle:", error);
    return {
      success: false,
      error: "Failed to create new cycle",
    };
  }
}

/**
 * Calculates and stores results for a completed cycle
 * Placeholder for future implementation
 *
 * @param password - Admin password
 * @param cycleId - The cycle ID
 * @returns Object with success status
 */
export async function calculateCycleResults(
  password: string,
  _cycleId: Cycle["id"]
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate password
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid admin password",
      };
    }

    // TODO: Implement cycle results calculation
    // This will be similar to the logic in processCycleRollover
    // but triggered manually by admin

    return {
      success: false,
      error: "Not yet implemented",
    };
  } catch (error) {
    console.error("Error calculating cycle results:", error);
    return {
      success: false,
      error: "Failed to calculate cycle results",
    };
  }
}

/**
 * Marks a cycle as completed
 * Placeholder for future implementation
 *
 * @param password - Admin password
 * @param cycleId - The cycle ID
 * @returns Object with success status
 */
export async function completeCycle(
  password: string,
  _cycleId: Cycle["id"]
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate password
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid admin password",
      };
    }

    // TODO: Implement cycle completion logic
    // May involve calculating results and creating next cycle

    return {
      success: false,
      error: "Not yet implemented",
    };
  } catch (error) {
    console.error("Error completing cycle:", error);
    return {
      success: false,
      error: "Failed to complete cycle",
    };
  }
}

/**
 * Creates a new token pattern for a group
 * Placeholder for future implementation
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param pattern - Token pattern (e.g., "papers-*")
 * @returns Object with success status
 */
export async function createTokenPattern(
  password: string,
  _groupId: Group["id"],
  _pattern: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate password
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid admin password",
      };
    }

    // TODO: Implement token pattern creation
    // Validate pattern format
    // Insert into token_patterns table

    return {
      success: false,
      error: "Not yet implemented",
    };
  } catch (error) {
    console.error("Error creating token pattern:", error);
    return {
      success: false,
      error: "Failed to create token pattern",
    };
  }
}

/**
 * Updates group settings
 * Placeholder for future implementation
 *
 * @param password - Admin password
 * @param groupId - The group ID
 * @param settings - Partial group settings to update
 * @returns Object with success status
 */
export async function updateGroupSettings(
  password: string,
  _groupId: Group["id"],
  _settings: Partial<InsertGroup>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate password
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        success: false,
        error: "Invalid admin password",
      };
    }

    // TODO: Implement group settings update
    // Validate settings
    // Update groups table

    return {
      success: false,
      error: "Not yet implemented",
    };
  } catch (error) {
    console.error("Error updating group settings:", error);
    return {
      success: false,
      error: "Failed to update group settings",
    };
  }
}
