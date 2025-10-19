"use client";

import PaperSubmission from "@/components/PaperSubmission";
import { Button } from "@/components/ui/button";
import type { Submission } from "@/lib/mock-backend";
import { X } from "lucide-react";

interface VotingChoiceSlotProps {
  choiceNumber: 1 | 2 | 3;
  submission: Submission | null;
  onSelect: () => void;
  onClear: () => void;
}

const CHOICE_LABELS = {
  1: "1st Choice",
  2: "2nd Choice",
  3: "3rd Choice",
} as const;

const CHOICE_WORDS = {
  1: "first",
  2: "second",
  3: "third",
} as const;

export function VotingChoiceSlot({
  choiceNumber,
  submission,
  onSelect,
  onClear,
}: VotingChoiceSlotProps) {
  if (submission) {
    return (
      <div className="p-1 bg-background hover:bg-primary/5 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1">
            <div className="flex items-center justify-center w-6 flex-shrink-0">
              <div className="mono text-xs tracking-[0.2em] uppercase text-foreground/60 font-medium -rotate-90 whitespace-nowrap">
                {CHOICE_LABELS[choiceNumber]}
              </div>
            </div>
            <div className="flex-1">
              <PaperSubmission submission={submission} isLastItem={true} />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="flex-shrink-0 rounded-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full p-8 text-center hover:bg-primary/5 transition-colors"
    >
      <div className="space-y-2">
        <div className="mono text-xs tracking-[0.2em] uppercase text-foreground/60 font-medium">
          {CHOICE_LABELS[choiceNumber]}
        </div>
        <p className="font-serif text-foreground/60 font-medium">
          Press to select your {CHOICE_WORDS[choiceNumber]} choice
        </p>
      </div>
    </button>
  );
}
