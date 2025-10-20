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
  const filteredResults = allResults
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

  // Fetch all submissions for each past cycle and compute rankings
  const pastResults = await Promise.all(
    filteredResults.map(async (result) => {
      // Get all submissions for this cycle
      const cycleSubmissions = await db.query.submissions.findMany({
        where: eq(submissions.cycleId, result.cycleId),
        with: {
          participant: true,
        },
      });

      // Compute final ranks from elimination rounds
      const rankedSubmissions = cycleSubmissions.map((sub) => {
        let finalRank = cycleSubmissions.length; // Default to last place

        if (
          result.eliminationRounds &&
          Array.isArray(result.eliminationRounds)
        ) {
          // Find when this submission was eliminated or won
          const rounds = result.eliminationRounds as Array<{
            roundNumber: number;
            eliminated?: number;
            winner?: number;
            voteCounts: Record<number, number>;
          }>;

          // Check if this is the winner
          const winnerRound = rounds.find((r) => r.winner === sub.id);
          if (winnerRound) {
            finalRank = 1;
          } else {
            // Find elimination round
            const eliminationRound = rounds.find(
              (r) => r.eliminated === sub.id
            );
            if (eliminationRound) {
              // Rank = total submissions - round number + 1
              // (later eliminations = better ranks)
              finalRank =
                cycleSubmissions.length - eliminationRound.roundNumber + 1;
            }
          }
        } else if (sub.id === result.winningSubmission?.id) {
          finalRank = 1;
        }

        return {
          ...sub,
          finalRank,
        };
      });

      return {
        ...result,
        allSubmissions: rankedSubmissions,
      };
    })
  );

  // Get max ranks from group settings (or default to 3)
  const maxRanks = 3;

  // Note: existingVote and currentSubmissionCount are fetched client-side after token login
  const currentSubmissionCount = 0;

  return (
    <PapersPageClient
      initialSubmissions={currentSubmissions}
      cycle={cycle}
      status={status}
      pastResults={pastResults}
      maxRanks={maxRanks}
      groupId={groupId}
      currentSubmissionCount={currentSubmissionCount}
    />
  );
}
