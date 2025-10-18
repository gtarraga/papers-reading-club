"use client";

import { Card } from "@/components/ui/card";
import type {
  Cycle,
  CycleResult,
  CycleStatus,
  Group,
  Participant,
  Submission,
} from "@/db/types";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { useEffect, useOptimistic, useState } from "react";
import { PaperSubmissionForm } from "./PaperSubmissionForm";
import { ResultsDisplay } from "./ResultsDisplay";
import { StatusBanner } from "./StatusBanner";
import { VotingForm } from "./VotingForm";

interface PapersPageClientProps {
  initialSubmissions: Array<Submission & { participant: Participant }>;
  cycle: Cycle | null;
  status: CycleStatus | null;
  pastResults: Array<
    CycleResult & {
      cycle: Cycle;
      winningSubmission: Submission & { participant: Participant };
    }
  >;
  maxRanks: number;
  groupId: Group["id"];
}

export function PapersPageClient({
  initialSubmissions,
  cycle,
  status,
  pastResults,
  maxRanks,
  groupId,
}: PapersPageClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [showTokenPrompt, setShowTokenPrompt] = useState(false);

  const [optimisticSubmissions, addOptimistic] = useOptimistic(
    initialSubmissions,
    (state, newSubmission: Submission) => [
      ...state,
      newSubmission as Submission & { participant: Participant },
    ]
  );

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
    } else {
      setShowTokenPrompt(true);
    }
  }, []);

  if (!cycle || !status) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className={cn("p-12 bg-white border-black text-center")}>
            <h1 className="text-3xl font-mono font-bold mb-4">
              No Active Cycle
            </h1>
            <p className="text-lg font-serif text-stone-600">
              There's no active reading cycle at the moment. Check back later or
              contact an administrator to start a new cycle.
            </p>
          </Card>

          {pastResults.length > 0 && (
            <ResultsDisplay pastResults={pastResults} />
          )}
        </div>
      </div>
    );
  }

  const endDate =
    status === "submission"
      ? new Date(cycle.submissionEnd)
      : status === "voting"
      ? new Date(cycle.votingEnd)
      : new Date();

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Banner */}
        <StatusBanner cycle={cycle} status={status} endDate={endDate} />

        {/* Token Prompt */}
        {showTokenPrompt && !token && (
          <Card className={cn("p-6 bg-yellow-50 border-yellow-600")}>
            <h3 className="text-lg font-mono font-semibold mb-2">
              Token Required
            </h3>
            <p className="text-sm font-serif text-stone-600 mb-4">
              You need a token to participate. Enter your token in localStorage
              or contact an administrator.
            </p>
            <p className="text-xs font-mono text-stone-500">
              localStorage.setItem("token", "your-token")
            </p>
          </Card>
        )}

        {/* Submission Phase */}
        {status === "submission" && token && (
          <PaperSubmissionForm
            token={token}
            cycleId={cycle.id}
            groupId={groupId}
            onOptimisticAdd={addOptimistic}
          />
        )}

        {/* Current Submissions List */}
        {status === "submission" && optimisticSubmissions.length > 0 && (
          <Card className={cn("p-6 bg-white border-black")}>
            <h2 className="text-2xl font-mono font-bold mb-6">
              Current Submissions
            </h2>
            <div className="space-y-4">
              {optimisticSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={cn(
                    "p-4 border border-stone-200 rounded-md space-y-2",
                    submission.id < 0 && "opacity-60 animate-pulse"
                  )}
                >
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
                  <p className="text-xs font-serif text-stone-500">
                    Submitted by: {submission.participant?.firstName}{" "}
                    {submission.participant?.lastName}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Voting Phase */}
        {status === "voting" && token && (
          <VotingForm
            token={token}
            cycleId={cycle.id}
            groupId={groupId}
            submissions={optimisticSubmissions}
            maxRanks={maxRanks}
          />
        )}

        {/* Voting Phase - Show Submissions (read-only) */}
        {status === "voting" && !token && optimisticSubmissions.length > 0 && (
          <Card className={cn("p-6 bg-white border-black")}>
            <h2 className="text-2xl font-mono font-bold mb-6">
              Papers in This Cycle
            </h2>
            <div className="space-y-4">
              {optimisticSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border border-stone-200 rounded-md space-y-2"
                >
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
              ))}
            </div>
          </Card>
        )}

        {/* Past Results */}
        {pastResults.length > 0 && <ResultsDisplay pastResults={pastResults} />}
      </div>
    </div>
  );
}
