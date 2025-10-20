"use client";

import type { Participant, Submission } from "@/db/types";
import PaperSubmission from "./PaperSubmission";

interface SubmittedPapersListProps {
  submissions: Array<Submission & { participant: Participant }>;
  currentParticipant?: Participant;
  onDelete: (id: Submission["id"]) => Promise<void>;
}

export function SubmittedPapersList({
  submissions,
  currentParticipant,
  onDelete,
}: SubmittedPapersListProps) {
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
            user={currentParticipant}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
