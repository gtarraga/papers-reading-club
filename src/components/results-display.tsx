"use client";

import { Card } from "@/components/ui/card";
import type { Cycle, CycleResult, Participant, Submission } from "@/db/types";
import { format } from "date-fns";
import { ExternalLink, Trophy } from "lucide-react";
import { useState } from "react";

interface ResultsDisplayProps {
  pastResults: Array<
    CycleResult & {
      cycle: Cycle;
      winningSubmission: Submission & { participant: Participant };
    }
  >;
}

export function ResultsDisplay({ pastResults }: ResultsDisplayProps) {
  const [selectedCycle, setSelectedCycle] = useState(
    pastResults[0]?.cycle.cycleNumber
  );

  const selectedResult = pastResults.find(
    (r) => r.cycle.cycleNumber === selectedCycle
  );

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {pastResults.map((result) => (
          <button
            key={result.cycle.cycleNumber}
            onClick={() => setSelectedCycle(result.cycle.cycleNumber)}
            className={`px-5 py-3 rounded-md mono text-sm font-bold tracking-wider uppercase transition-all border-2 ${
              selectedCycle === result.cycle.cycleNumber
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            Cycle {String(result.cycle.cycleNumber).padStart(2, "0")}
          </button>
        ))}
      </div>

      {selectedResult && (
        <div className="space-y-8">
          {/* Winner Card */}
          <Card className="p-8 border-2 border-primary bg-primary/5 shadow-none">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="mono text-xs tracking-[0.2em] uppercase text-primary font-bold">
                    Winner
                  </div>
                  <div className="mono text-xs text-muted-foreground tracking-wider">
                    {format(
                      selectedResult.cycle.votingEnd,
                      "MMM d, yyyy"
                    ).toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold leading-tight">
                  {selectedResult.winningSubmission.title}
                </h3>
                <p className="mono text-sm text-muted-foreground tracking-wider">
                  SUBMITTED BY{" "}
                  {selectedResult.winningSubmission.participant.firstName.toUpperCase()}
                  {selectedResult.winningSubmission.participant.lastName &&
                    ` ${selectedResult.winningSubmission.participant.lastName.toUpperCase()}`}
                </p>
              </div>
              <a
                href={selectedResult.winningSubmission.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm mono tracking-wider text-primary hover:underline uppercase font-medium"
              >
                Read Paper
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>

          {/* Voting Summary */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold tracking-tight">
              Voting Summary
            </h4>
            <Card className="p-5 border-2 shadow-none">
              <div className="space-y-2">
                <p className="mono text-sm text-muted-foreground">
                  Total Votes:{" "}
                  <span className="font-bold">{selectedResult.totalVotes}</span>
                </p>
                {selectedResult.eliminationRounds != null && (
                  <p className="mono text-sm text-muted-foreground">
                    Elimination Rounds:{" "}
                    <span className="font-bold">
                      {Array.isArray(selectedResult.eliminationRounds)
                        ? (selectedResult.eliminationRounds as Array<unknown>)
                            .length
                        : 1}
                    </span>
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
