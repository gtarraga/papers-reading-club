"use client";

import { submitVote } from "@/actions/vote.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Cycle, Group, Submission } from "@/db/types";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { useActionState, useState } from "react";

interface VotingFormProps {
  token: string;
  cycleId: Cycle["id"];
  groupId: Group["id"];
  submissions: Submission[];
  maxRanks: number;
}

type FormState = {
  success: boolean;
  error?: string;
};

export function VotingForm({
  token,
  cycleId,
  groupId,
  submissions,
  maxRanks,
}: VotingFormProps) {
  const [rankings, setRankings] = useState<Record<number, number>>({});

  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState): Promise<FormState> => {
      // Convert rankings object to array format expected by server action
      const rankingsArray = Object.entries(rankings).map(
        ([submissionIdStr, rank]) => ({
          submissionId: parseInt(submissionIdStr),
          rank,
        })
      );

      // Call server action
      const result = await submitVote(token, cycleId, groupId, rankingsArray);

      return {
        success: result.success,
        error: result.error,
      };
    },
    { success: false }
  );

  const handleRankChange = (submissionId: number, rank: string) => {
    if (rank === "") {
      // Remove ranking
      const newRankings = { ...rankings };
      delete newRankings[submissionId];
      setRankings(newRankings);
    } else {
      // Add or update ranking
      setRankings({
        ...rankings,
        [submissionId]: parseInt(rank),
      });
    }
  };

  const rankedCount = Object.keys(rankings).length;
  const canSubmit = rankedCount > 0 && rankedCount === maxRanks;

  if (submissions.length === 0) {
    return (
      <Card className={cn("p-6 bg-white border-black")}>
        <p className="text-center font-serif text-stone-600">
          No submissions to vote on yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 bg-white border-black")}>
      <div className="mb-6">
        <h2 className="text-2xl font-mono font-bold mb-2">Cast Your Vote</h2>
        <p className="text-sm font-serif text-stone-600">
          Rank exactly {maxRanks} paper{maxRanks !== 1 ? "s" : ""} (
          {rankedCount} of {maxRanks} selected)
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={cn(
                "p-4 border border-stone-200 rounded-md space-y-2",
                rankings[submission.id] && "border-black bg-stone-50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="font-mono font-semibold text-lg">
                    {submission.title}
                  </h3>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-blue-600 hover:underline block"
                  >
                    {submission.url}
                  </a>
                  {submission.publicationDate && (
                    <p className="text-sm font-serif text-stone-600">
                      Published:{" "}
                      {format(
                        new Date(submission.publicationDate),
                        "MMM d, yyyy"
                      )}
                    </p>
                  )}
                  {submission.recommendation && (
                    <p className="text-sm font-serif mt-2">
                      {submission.recommendation}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <select
                    value={rankings[submission.id] || ""}
                    onChange={(e) =>
                      handleRankChange(submission.id, e.target.value)
                    }
                    disabled={pending}
                    className={cn(
                      "font-mono border border-stone-300 rounded-md px-3 py-2",
                      "focus:outline-none focus:ring-2 focus:ring-black",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <option value="">No rank</option>
                    {Array.from({ length: maxRanks }, (_, i) => {
                      const rank = i + 1;
                      // Disable if another submission already has this rank
                      const alreadyUsed = Object.entries(rankings).some(
                        ([idStr, r]) =>
                          parseInt(idStr) !== submission.id && r === rank
                      );
                      return (
                        <option key={rank} value={rank} disabled={alreadyUsed}>
                          Rank {rank}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            disabled={pending || !canSubmit}
            className="w-full font-mono"
          >
            {pending
              ? "Submitting Vote..."
              : canSubmit
              ? "Submit Vote"
              : `Select ${maxRanks - rankedCount} more`}
          </Button>

          {!canSubmit && rankedCount > 0 && (
            <p className="text-sm text-center font-serif text-stone-600">
              You must rank exactly {maxRanks} paper{maxRanks !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {state.error && (
          <p
            className="text-sm text-red-600 font-serif text-center"
            role="alert"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            className="text-sm text-green-600 font-serif text-center"
            role="status"
          >
            Vote submitted successfully!
          </p>
        )}
      </form>
    </Card>
  );
}
