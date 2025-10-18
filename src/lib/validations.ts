import { z } from "zod";

/**
 * Token validation schema
 * Tokens must be alphanumeric with hyphens and underscores
 */
export const tokenSchema = z
  .string()
  .min(3, "Token must be at least 3 characters")
  .max(100, "Token must be at most 100 characters")
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    "Token can only contain letters, numbers, hyphens, and underscores"
  );

/**
 * Participant registration schema
 */
export const participantSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
});

/**
 * Paper submission schema
 */
export const submissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  url: z.string().url("Invalid URL format"),
  publicationDate: z.date().optional(),
  recommendation: z.string().max(2000, "Recommendation is too long").optional(),
});

/**
 * Vote submission schema
 */
export const voteSchema = z.object({
  rankings: z
    .array(
      z.object({
        submissionId: z.number().int().positive("Invalid submission ID"),
        rank: z.number().int().positive("Rank must be a positive integer"),
      })
    )
    .min(1, "At least one ranking is required"),
});

/**
 * Admin password schema
 */
export const adminPasswordSchema = z.string().min(1, "Password is required");
