import type {
  EliminationRound,
  Submission,
  Vote,
  VoteRanking,
} from "@/db/types";

/**
 * Vote data structure with rankings
 */
type VoteWithRankings = Vote & {
  rankings: VoteRanking[];
};

/**
 * Calculates the winner using Instant-Runoff Voting (ranked-choice voting)
 *
 * Algorithm:
 * 1. Count first-choice votes for each submission
 * 2. If any submission has >50% of votes, it wins
 * 3. Otherwise, eliminate the submission with fewest first-choice votes
 * 4. Redistribute those votes to their next-ranked choice
 * 5. Repeat until a winner is found or tie occurs
 *
 * @param votes - Array of votes with their rankings
 * @param submissions - Array of all submissions in the cycle
 * @returns Object with winnerId and array of elimination rounds
 */
export function calculateInstantRunoffWinner(
  votes: VoteWithRankings[],
  submissions: Submission[]
): {
  winnerId: Submission["id"] | null;
  rounds: EliminationRound[];
} {
  // If no submissions, return null winner and empty rounds
  if (submissions.length === 0) return { winnerId: null, rounds: [] };

  // If no votes, pick a random winner from the submissions if any
  if (votes.length === 0) {
    const randomIndex = Math.floor(Math.random() * submissions.length);
    return {
      winnerId: submissions[randomIndex].id,
      rounds: [
        {
          roundNumber: 1,
          voteCounts: { [submissions[randomIndex].id]: 0 },
          winner: submissions[randomIndex].id,
        },
      ],
    };
  }

  // Handle single submission case
  if (submissions.length === 1) {
    return {
      winnerId: submissions[0].id,
      rounds: [
        {
          roundNumber: 1,
          voteCounts: { [submissions[0].id]: votes.length },
          winner: submissions[0].id,
        },
      ],
    };
  }

  const rounds: EliminationRound[] = [];
  const activeSubmissionIds = new Set(submissions.map((s) => s.id));
  let roundNumber = 0;
  const totalVotes = votes.length;
  const majorityThreshold = Math.floor(totalVotes / 2) + 1;

  // Create a map of current vote preferences (which submission each vote is currently for)
  const votePreferences = new Map<Vote["id"], Submission["id"] | null>();

  // Initialize vote preferences based on rankings
  for (const vote of votes) {
    // Find the highest-ranked active submission
    const sortedRankings = vote.rankings
      .filter((r) => activeSubmissionIds.has(r.submissionId))
      .sort((a, b) => a.rank - b.rank);

    votePreferences.set(vote.id, sortedRankings[0]?.submissionId || null);
  }

  // Run elimination rounds
  while (activeSubmissionIds.size > 1) {
    roundNumber++;

    // Count votes for each active submission
    const voteCounts: Record<number, number> = {};
    for (const submissionId of activeSubmissionIds) {
      voteCounts[submissionId] = 0;
    }

    for (const [, preferredSubmissionId] of votePreferences) {
      if (
        preferredSubmissionId &&
        activeSubmissionIds.has(preferredSubmissionId)
      ) {
        voteCounts[preferredSubmissionId]++;
      }
    }

    // Check for majority winner
    for (const [submissionId, count] of Object.entries(voteCounts)) {
      if (count >= majorityThreshold) {
        rounds.push({
          roundNumber,
          voteCounts,
          winner: Number(submissionId),
        });

        return {
          winnerId: Number(submissionId),
          rounds,
        };
      }
    }

    // Find submission(s) with fewest votes to eliminate
    const minVotes = Math.min(...Object.values(voteCounts));
    const candidatesForElimination = Object.entries(voteCounts)
      .filter(([, count]) => count === minVotes)
      .map(([id]) => Number(id));

    // If all remaining candidates are tied, pick the first one as winner
    if (candidatesForElimination.length === activeSubmissionIds.size) {
      const winner = candidatesForElimination[0];
      rounds.push({
        roundNumber,
        voteCounts,
        winner,
      });

      return {
        winnerId: winner,
        rounds,
      };
    }

    // Eliminate the candidate with fewest votes (break ties by lowest ID)
    const eliminated = Math.min(...candidatesForElimination);
    activeSubmissionIds.delete(eliminated);

    rounds.push({
      roundNumber,
      eliminated,
      voteCounts,
    });

    // Redistribute votes from eliminated candidate
    for (const vote of votes) {
      const currentPreference = votePreferences.get(vote.id);

      // If this vote was for the eliminated candidate, find next preference
      if (currentPreference === eliminated) {
        const sortedRankings = vote.rankings
          .filter((r) => activeSubmissionIds.has(r.submissionId))
          .sort((a, b) => a.rank - b.rank);

        votePreferences.set(vote.id, sortedRankings[0]?.submissionId || null);
      }
    }
  }

  // If we exit the loop with one candidate remaining, they win
  const winner = Array.from(activeSubmissionIds)[0] || null;

  if (winner) {
    rounds.push({
      roundNumber: roundNumber + 1,
      voteCounts: { [winner]: totalVotes },
      winner,
    });
  }

  return {
    winnerId: winner,
    rounds,
  };
}
