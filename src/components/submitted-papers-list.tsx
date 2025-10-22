"use client";

import type { Participant, Submission } from "@/db/types";
import PaperSubmission from "./PaperSubmission";

interface SubmittedPapersListProps {
  submissions: Array<Submission & { participant: Participant }>;
}

export function SubmittedPapersList({ submissions }: SubmittedPapersListProps) {
  if (submissions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Papers In This Cycle
        </h2>
        <span className="mono text-sm text-foreground/60 font-medium">
          {submissions.length} {submissions.length === 1 ? "paper" : "papers"}
        </span>
      </div>
      <div className="border border-foreground rounded-xs overflow-hidden">
        {submissions.map((submission, index) => (
          <PaperSubmission
            key={submission.id}
            submission={submission}
            isLastItem={index === submissions.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
