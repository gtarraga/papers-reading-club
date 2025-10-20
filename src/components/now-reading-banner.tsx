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
      <div className=" w-full md:max-w-lg mx-auto p-6 bg-background">
        {/* Header Bar */}

        <div className="isolate">
          <div className="relative border border-muted bg-[url(/paper.jpg)] bg-cover mix-blend-lighten bg-center px-6 py-4 rounded-xs ">
            {/* Corner Accents */}
            <div className="absolute -top-0.25 -left-0.25 w-6 h-6 border-t-2 border-l-2 border-foreground" />
            <div className="absolute -top-0.25 -right-0.25 w-6 h-6 border-t-2 border-r-2 border-foreground " />
            <div className="absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 border-foreground " />
            <div className="absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 border-foreground" />

            <div className="space-y-2">
              <div className="mono text-xs text-foreground/60 tracking-[0.3em] uppercase font-medium">
                Now Reading
              </div>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group hover:underline decoration-primary decoration-3 underline-offset-1"
              >
                <h4 className="inline text-2xl font-bold tracking-tight leading-tight break-all">
                  {currentPaper.winningSubmission.title}
                </h4>
                <ExternalLink className="inline h-5 w-5 ml-2 text-primary stroke-[2] align-baseline" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto px-6 max-w-2xl isolate">
        <div className="relative border border-muted bg-[url(/paper.jpg)] bg-cover mix-blend-lighten bg-center p-8 py-4 rounded-xs">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-foreground -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-foreground translate-x-px -translate-y-px" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-foreground -translate-x-px translate-y-px" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-foreground translate-x-px translate-y-px" />

          <div className="space-y-4">
            <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Cycle {String(currentPaper.cycle.cycleNumber).padStart(2, "0")} —
              Now Reading
            </div>

            <h2 className="text-2xl font-bold tracking-tight leading-tight break-all">
              {currentPaper.winningSubmission.title}
            </h2>

            <div className="flex items-center justify-between pt-2">
              <div className="mono text-sm text-foreground/70 uppercase">
                Submitted by{" "}
                {currentPaper.winningSubmission.participant.firstName.toUpperCase()}
                {currentPaper.winningSubmission.participant.lastName &&
                  ` ${currentPaper.winningSubmission.participant.lastName.toUpperCase()}`}
              </div>

              <a
                href={currentPaper.winningSubmission.url}
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase inline-flex items-center gap-2 mono text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
