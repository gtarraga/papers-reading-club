"use client";

import type { Cycle, CycleResult, Participant, Submission } from "@/db/types";
import { ExternalLink } from "lucide-react";

interface NowReadingBannerProps {
  currentPaper:
    | (CycleResult & {
        cycle: Cycle;
        winningSubmission: Submission & { participant: Participant };
      })
    | null;
  variant?: "default" | "compact";
}

export function NowReadingBanner({
  currentPaper,
  variant = "default",
}: NowReadingBannerProps) {
  if (!currentPaper) return null;

  // Compact variant - square button
  if (variant === "compact") {
    return (
      <a
        className="bg-background py-12 text-center"
        href={currentPaper.winningSubmission.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="mx-auto w-40 aspect-square">
          <div className="relative h-full border border-muted bg-[url(/paper.jpg)] bg-cover bg-center p-6 rounded-xs">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-foreground -translate-x-px -translate-y-px" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-foreground translate-x-px -translate-y-px" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-foreground -translate-x-px translate-y-px" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-foreground translate-x-px translate-y-px" />

            <div className="h-full">
              <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
                Now Reading
              </div>

              <div className="flex items-center gap-2 mono text-sm font-medium text-primary hover:text-primary/80 transition-colors justify-center h-full">
                <ExternalLink className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </a>
    );
  }

  // Default variant
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto px-6 max-w-2xl isolate">
        <div className="relative border border-muted bg-[url(/paper.jpg)] bg-cover mix-blend-lighten bg-center p-8 rounded-xs">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-foreground -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-foreground translate-x-px -translate-y-px" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-foreground -translate-x-px translate-y-px" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-foreground translate-x-px translate-y-px" />

          <div className="space-y-4">
            <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Now Reading — Cycle{" "}
              {currentPaper.cycle.cycleNumber.toString().padStart(2, "0")}
            </div>

            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {currentPaper.winningSubmission.title}
            </h2>

            <div className="flex items-center justify-between pt-2">
              <div className="mono text-sm text-foreground/70">
                Selected by{" "}
                {currentPaper.winningSubmission.participant.firstName.toUpperCase()}
                {currentPaper.winningSubmission.participant.lastName &&
                  ` ${currentPaper.winningSubmission.participant.lastName.toUpperCase()}`}
              </div>

              <a
                href={currentPaper.winningSubmission.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mono text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Read Paper
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
