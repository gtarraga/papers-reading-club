import { PapersPageClient } from "@/components/papers-page-client";
import { db } from "@/db";
import { cycleResults, submissions } from "@/db/schema";
import type { Group } from "@/db/types";
import { getCurrentCycle, getCycleStatus } from "@/lib/cycle";
import { desc, eq } from "drizzle-orm";

export default async function PapersPage() {
  // Default group ID for the reading club
  // Token patterns are configured per group, so only valid tokens can access this group's data
  // For multi-group support: make this dynamic based on subdomain/path or user session
  const groupId: Group["id"] = 1;

  // Fetch current cycle
  const cycle = await getCurrentCycle(groupId);
  const status = cycle ? getCycleStatus(cycle) : null;

  // Fetch submissions for current cycle
  const currentSubmissions = cycle
    ? await db.query.submissions.findMany({
        where: eq(submissions.cycleId, cycle.id),
        with: {
          participant: true,
        },
        orderBy: [desc(submissions.submittedAt)],
      })
    : [];

  // Fetch past results (filter by group through cycle relation)
  const allResults = await db.query.cycleResults.findMany({
    with: {
      cycle: true,
      winningSubmission: {
        with: {
          participant: true,
        },
      },
    },
    orderBy: [desc(cycleResults.calculatedAt)],
  });

  // Filter for this group and ensure winningSubmission exists
  const pastResults = allResults
    .filter(
      (result) =>
        result.cycle.groupId === groupId && result.winningSubmission !== null
    )
    .slice(0, 10) as Array<
    (typeof allResults)[0] & {
      winningSubmission: NonNullable<
        (typeof allResults)[0]["winningSubmission"]
      >;
    }
  >;

  // Get max ranks from group settings (or default to 3)
  const maxRanks = 3;

  // TODO: Get current user's participant and vote
  // For now, we'll pass null and let the component handle token-based auth
  const existingVote = null;
  const currentSubmissionCount = 0; // Will be calculated based on participant after login

  return (
    <PapersPageClient
      initialSubmissions={currentSubmissions}
      cycle={cycle}
      status={status}
      pastResults={pastResults}
      maxRanks={maxRanks}
      groupId={groupId}
      existingVote={existingVote}
      currentSubmissionCount={currentSubmissionCount}
    />
  );
}
