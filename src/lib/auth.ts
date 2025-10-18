import { db } from "@/db";
import { participants, tokenPatterns } from "@/db/schema";
import type { Group, Participant } from "@/db/types";
import { and, eq } from "drizzle-orm";

/**
 * Validates a token against active patterns for a group
 * Converts wildcard patterns (e.g., "papers-*") to regex and tests the token
 *
 * @param token - The token to validate
 * @param groupId - The group ID to check patterns for
 * @returns True if token matches any active pattern
 */
export async function validateToken(
  token: string,
  groupId: Group["id"]
): Promise<boolean> {
  // Fetch active token patterns for the group
  const patterns = await db.query.tokenPatterns.findMany({
    where: and(
      eq(tokenPatterns.groupId, groupId),
      eq(tokenPatterns.isActive, true)
    ),
  });

  if (patterns.length === 0) {
    return false;
  }

  // Test token against each pattern
  for (const patternRecord of patterns) {
    // Convert wildcard pattern to regex
    // e.g., "papers-*" becomes /^papers-.*$/
    const regexPattern = patternRecord.pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*/g, ".*"); // Replace * with .*

    const regex = new RegExp(`^${regexPattern}$`, "i"); // Case-insensitive

    if (regex.test(token)) {
      return true;
    }
  }

  return false;
}

/**
 * Gets an existing participant or creates a new one (auto-registration)
 * Requires firstName and lastName for new participants
 *
 * @param token - The participant's token
 * @param groupId - The group ID
 * @param firstName - First name (required for new participants)
 * @param lastName - Last name (required for new participants)
 * @returns The participant record
 * @throws Error if token is invalid or names are missing for new participants
 */
export async function getOrCreateParticipant(
  token: string,
  groupId: Group["id"],
  firstName?: string,
  lastName?: string
): Promise<Participant> {
  // First validate the token
  const isValid = await validateToken(token, groupId);
  if (!isValid) {
    throw new Error("Invalid token for this group");
  }

  // Check if participant already exists
  const existingParticipant = await db.query.participants.findFirst({
    where: and(
      eq(participants.token, token),
      eq(participants.groupId, groupId)
    ),
  });

  if (existingParticipant) {
    return existingParticipant;
  }

  // New participant - require names
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required for registration");
  }

  // Create new participant
  const [newParticipant] = await db
    .insert(participants)
    .values({
      groupId,
      token,
      firstName,
      lastName,
      registeredAt: new Date(),
    })
    .returning();

  return newParticipant;
}
