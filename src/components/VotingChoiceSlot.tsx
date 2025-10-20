"use client";

import PaperSubmission from "@/components/PaperSubmission";
import { Button } from "@/components/ui/button";
import type { Participant, Submission } from "@/db/types";
import { X } from "lucide-react";

interface VotingChoiceSlotProps {
  choiceNumber: number;
  submission: (Submission & { participant?: Participant }) | null;
  onSelect: () => void;
  onClear: () => void;
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Helper function to get ordinal word
function getOrdinalWord(n: number): string {
  const words = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
  ];
  return words[n - 1] || `${getOrdinal(n)}`;
}

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
                {getOrdinal(choiceNumber)} Choice
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
          {getOrdinal(choiceNumber)} Choice
        </div>
        <p className="font-serif text-foreground/60 font-medium">
          Press to select your {getOrdinalWord(choiceNumber)} choice
        </p>
      </div>
    </button>
  );
}
