"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Cycle, CycleResult, Participant, Submission } from "@/db/types";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

interface ResultsDisplayProps {
  pastResults: Array<
    CycleResult & {
      cycle: Cycle;
      winningSubmission: Submission & { participant: Participant };
    }
  >;
}

export function ResultsDisplay({ pastResults }: ResultsDisplayProps) {
  if (pastResults.length === 0) {
    return (
      <Card className={cn("p-6 bg-white border-black")}>
        <h2 className="text-2xl font-mono font-bold mb-4">Past Results</h2>
        <p className="text-center font-serif text-stone-600">
          No past results yet. Check back after the first cycle completes!
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 bg-white border-black")}>
      <h2 className="text-2xl font-mono font-bold mb-6">Past Results</h2>

      <Tabs
        defaultValue={pastResults[0]?.cycle.id.toString()}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          {pastResults.map((result) => (
            <TabsTrigger
              key={result.cycle.id}
              value={result.cycle.id.toString()}
              className="font-mono"
            >
              Cycle {result.cycle.cycleNumber}
            </TabsTrigger>
          ))}
        </TabsList>

        {pastResults.map((result) => {
          return (
            <TabsContent
              key={result.cycle.id}
              value={result.cycle.id.toString()}
              className="mt-6 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-mono font-semibold">
                  Cycle {result.cycle.cycleNumber}
                </h3>
                <p className="text-sm font-serif text-stone-600">
                  Completed on{" "}
                  {format(
                    new Date(result.calculatedAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <p className="text-sm font-serif text-stone-600">
                  Total votes: {result.totalVotes}
                </p>
              </div>

              <div className="border-l-4 border-black pl-4 space-y-2">
                <h4 className="text-sm font-mono font-semibold uppercase tracking-wide">
                  Winner
                </h4>
                <h3 className="text-xl font-mono font-bold">
                  {result.winningSubmission.title}
                </h3>
                <a
                  href={result.winningSubmission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-blue-600 hover:underline block"
                >
                  {result.winningSubmission.url}
                </a>
                {result.winningSubmission.publicationDate && (
                  <p className="text-sm font-serif text-stone-600">
                    Published:{" "}
                    {format(
                      new Date(result.winningSubmission.publicationDate),
                      "MMM d, yyyy"
                    )}
                  </p>
                )}
                {result.winningSubmission.recommendation && (
                  <p className="text-sm font-serif mt-3">
                    {result.winningSubmission.recommendation}
                  </p>
                )}
                <p className="text-sm font-serif text-stone-600 mt-2">
                  Submitted by:{" "}
                  <span className="font-semibold">
                    {result.winningSubmission.participant.firstName}{" "}
                    {result.winningSubmission.participant.lastName}
                  </span>
                </p>
              </div>

              {result.eliminationRounds != null && (
                <div className="space-y-3">
                  <h4 className="text-sm font-mono font-semibold uppercase tracking-wide">
                    Voting Summary
                  </h4>
                  <p className="text-sm font-serif text-stone-600">
                    Winner determined through{" "}
                    {Array.isArray(result.eliminationRounds)
                      ? (result.eliminationRounds as Array<unknown>).length
                      : 1}{" "}
                    round(s) of instant-runoff voting.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
