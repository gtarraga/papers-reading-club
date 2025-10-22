"use client";

import PaperSubmission from "@/components/PaperSubmission";
import type { Cycle, CycleResult, Participant, Submission } from "@/db/types";
import { format } from "date-fns";
import { ExternalLink, Trophy } from "lucide-react";
import { useState } from "react";

interface ResultsDisplayProps {
  pastResults: Array<
    CycleResult & {
      cycle: Cycle;
      winningSubmission: Submission & { participant: Participant };
      allSubmissions?: Array<
        Submission & { participant: Participant; finalRank: number }
      >;
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

  const sortedResults = [...pastResults].sort(
    (a, b) => a.cycle.cycleNumber - b.cycle.cycleNumber
  );

  return (
    <div className="space-y-0">
      <div className="relative">
        {/* Tabs as stacked papers */}
        <div className="flex gap-0 relative">
          {/* Background block for empty space */}
          <div className="absolute inset-0  border-b-2 border-foreground" />

          {/* Tabs as stacked papers */}
          <div className="relative z-10 flex gap-0">
            {sortedResults.map((result, index) => {
              const isSelected = selectedCycle === result.cycle.cycleNumber;
              return (
                <button
                  key={result.cycle.cycleNumber}
                  onClick={() => setSelectedCycle(result.cycle.cycleNumber)}
                  className={`
                    relative px-6 py-3 mono text-sm font-bold tracking-wider border-t-2 border-b-0 border-x-2 border-foreground transition-colors
                    ${
                      isSelected
                        ? "bg-background text-primary z-10 border-b-transparent"
                        : "bg-background text-foreground/60 hover:text-foreground border-b-2"
                    }
                    ${index === 0 ? "rounded-tl-xs" : ""}
                    ${index !== 0 ? "-ml-[2px]" : ""}
                  `}
                >
                  {String(result.cycle.cycleNumber).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content box - flush with selected tab */}
        {selectedResult && (
          <div className="border-2 border-t-0 border-foreground bg-background overflow-hidden">
            {/* Winner Section */}
            <div className="p-3 md:p-8 md:py-6 border-b-1 border-foreground bg-background flex flex-col justify-center">
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between pt-1 px-1 md:pt-0 md:px-0">
                  <div className="flex items-center gap-4">
                    <Trophy className="w-6 h-6 text-primary" />
                    <div className="space-y-1">
                      <div className="mono text-xs tracking-[0.2em] uppercase text-primary font-bold">
                        Winner
                      </div>
                      <div className="mono text-xs text-foreground/60 tracking-wider">
                        {format(
                          selectedResult.cycle.votingEnd,
                          "MMM d, yyyy"
                        ).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href={selectedResult.winningSubmission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm mono tracking-wider text-primary hover:underline uppercase font-medium"
                    >
                      Read Paper
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-4">
                  <div className="space-y-2 md:space-y-1">
                    <h3 className="text-2xl font-bold leading-tight">
                      <a
                        href={selectedResult.winningSubmission.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline decoration-primary decoration-3 underline-offset-1"
                      >
                        {selectedResult.winningSubmission.title}
                      </a>
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs mono tracking-wider text-foreground/60 font-medium">
                      {selectedResult.winningSubmission.publicationDate && (
                        <>
                          <span>
                            PUBLISHED{" "}
                            {format(
                              selectedResult.winningSubmission.publicationDate,
                              "MMM d, yyyy"
                            ).toUpperCase()}
                          </span>
                          <span className="hidden md:inline">•</span>
                        </>
                      )}
                      {selectedResult.winningSubmission.participant && (
                        <span>
                          SUBMITTED BY{" "}
                          {selectedResult.winningSubmission.participant.firstName.toUpperCase()}
                          {selectedResult.winningSubmission.participant
                            .lastName &&
                            ` ${selectedResult.winningSubmission.participant.lastName.toUpperCase()}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-foreground/90 font-medium">
                    {selectedResult.winningSubmission.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Other submissions if available */}
            {selectedResult.allSubmissions &&
              selectedResult.allSubmissions.length > 0 &&
              selectedResult.allSubmissions
                .sort((a, b) => a.finalRank - b.finalRank)
                .slice(1) // Skip winner (rank 1)
                .map((submission, index, array) => (
                  <div
                    key={submission.id}
                    className="flex flex-col md:flex-row border-b-1 border-foreground"
                  >
                    {/* Rank label - matching voting form style */}
                    <div className="flex items-center pt-3 pl-3 md:pl-0 md:pt-0 md:justify-center md:w-5 md:ml-1 md:flex-shrink-0">
                      <div className="mono text-xs uppercase text-foreground/60 font-medium whitespace-nowrap md:-rotate-90">
                        {"RANK " + submission.finalRank}
                      </div>
                    </div>
                    {/* Submission content */}
                    <div className="flex-1">
                      <PaperSubmission
                        submission={submission}
                        isLastItem={index === array.length - 1}
                        className="px-3 border-0 py-2 md:py-4"
                      />
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
