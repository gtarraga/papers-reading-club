"use server";

import type { Group, Participant } from "@/db/types";
import { getOrCreateParticipant, validateToken } from "@/lib/auth";
import { participantSchema, tokenSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

/**
 * Validates a participant token against group patterns
 *
 * @param token - The token to validate
 * @param groupId - The group ID to check patterns for
 * @returns Object with valid boolean and optional error message
 */
export async function validateParticipantToken(
  token: string,
  groupId: Group["id"]
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Validate token format
    const tokenValidation = tokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      return {
        valid: false,
        error:
          tokenValidation.error.issues[0]?.message || "Invalid token format",
      };
    }

    // Check token against group patterns
    const isValid = await validateToken(token, groupId);

    if (!isValid) {
      return {
        valid: false,
        error: "Token does not match any active patterns for this group",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating participant token:", error);
    return {
      valid: false,
      error: "Failed to validate token",
    };
  }
}

/**
 * Extracts name from token pattern (e.g., "papers-john-doe-iag" -> {firstName: "John", lastName: "Doe"})
 */
function extractNameFromToken(token: string): {
  firstName: string;
  lastName: string;
} {
  const parts = token.split("-");

  // Format: papers-<firstname>-<lastname>-<groupid>
  // Minimum: papers-name-groupid (3 parts)
  if (parts.length >= 3) {
    // Remove first part (prefix like "papers") and last part (group id like "iag")
    const nameParts = parts.slice(1, -1);

    if (nameParts.length === 1) {
      // Single name: "papers-alice-iag" -> firstName: "Alice", lastName: ""
      const name = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      return { firstName: name, lastName: "" };
    } else {
      // Multiple parts: "papers-john-doe-iag" -> firstName: "John", lastName: "Doe"
      const firstName =
        nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      const lastName = nameParts
        .slice(1)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      return { firstName, lastName };
    }
  }

  // Fallback: use generic names
  return { firstName: "User", lastName: "" };
}

/**
 * Validates token and returns participant data
 * Used for login flow - auto-creates participant with name extracted from token
 *
 * @param token - The participant's token
 * @param groupId - The group ID
 * @returns Object with success status, participant data, and optional error
 */
export async function validateTokenAction(
  token: string,
  groupId: Group["id"]
): Promise<{
  success: boolean;
  participant?: Participant | null;
  error?: string;
}> {
  try {
    // Validate token format
    const tokenValidation = tokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      return {
        success: false,
        error:
          tokenValidation.error.issues[0]?.message || "Invalid token format",
      };
    }

    // Check if token matches any pattern
    const isValid = await validateToken(token, groupId);

    if (!isValid) {
      return {
        success: false,
        error: "Invalid token. Please check your token and try again.",
      };
    }

    // Extract names from token
    const { firstName, lastName } = extractNameFromToken(token);

    // Get or create participant with extracted names
    const participant = await getOrCreateParticipant(
      token,
      groupId,
      firstName,
      lastName
    );

    return {
      success: true,
      participant,
    };
  } catch (error) {
    console.error("Error validating token:", error);
    return {
      success: false,
      error: "Failed to validate token",
    };
  }
}

/**
 * Registers a new participant or retrieves existing one
 * Auto-registration: creates participant on first valid token use
 *
 * @param token - The participant's token
 * @param groupId - The group ID
 * @param firstName - First name (required for new participants)
 * @param lastName - Last name (required for new participants)
 * @returns Object with success status, participant data, and optional error
 */
export async function registerParticipant(
  token: string,
  groupId: Group["id"],
  firstName: string,
  lastName: string
): Promise<{
  success: boolean;
  participant?: Participant;
  error?: string;
}> {
  try {
    // Validate token format
    const tokenValidation = tokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      return {
        success: false,
        error:
          tokenValidation.error.issues[0]?.message || "Invalid token format",
      };
    }

    // Validate participant data
    const participantValidation = participantSchema.safeParse({
      firstName,
      lastName,
    });
    if (!participantValidation.success) {
      return {
        success: false,
        error:
          participantValidation.error.issues[0]?.message ||
          "Invalid participant data",
      };
    }

    // Get or create participant
    const participant = await getOrCreateParticipant(
      token,
      groupId,
      firstName,
      lastName
    );

    // Revalidate papers page
    revalidatePath("/papers");

    return {
      success: true,
      participant,
    };
  } catch (error) {
    console.error("Error registering participant:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to register participant";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
