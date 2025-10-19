"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

type CycleStatus = "submission" | "voting" | "completed";

interface Cycle {
  cycleNumber: number;
  submissionEnd: Date;
  votingEnd: Date;
}

interface StatusBannerProps {
  cycle: Cycle;
  status: CycleStatus;
}

/**
 * BANNER ARCHIVE
 *
 * This file contains all the banner design iterations created during the design exploration phase.
 * These are kept for archive purposes and reference but are not used in production.
 *
 * Active Banners in Production:
 * - StatusBannerFinal1: Small watermark, compact design
 * - StatusBanner5: Original right-aligned design (non-compact)
 *
 * Archived Variants:
 * - StatusBanner: Original three-column layout
 * - StatusBanner2: Left-aligned with large background number
 * - StatusBanner3: Animated scrolling ticker
 * - StatusBanner4: Header bar with two-section layout
 * - StatusBannerFinal2: Medium watermark (removed)
 * - StatusBannerFinal3: Balanced spacing variant
 * - StatusBannerFinal3Sub: Balanced spacing submission state
 * - StatusBannerFinal4: Bold typography variant
 * - StatusBannerFinal4Sub: Bold typography submission state
 * - StatusBannerFinal5: Centered layout variant
 * - StatusBanner4Horizontal: Single-line horizontal layout
 * - StatusBanner5Compact: Inline right-aligned
 * - StatusBanner5CompactSmall: Small watermark inline
 * - StatusBanner5CompactCentered: Centered inline
 * - StatusBanner5CompactMinimal: Minimal no-header design
 */

// Original Banner 1
export function StatusBanner({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const targetDate =
        status === "submission" ? cycle.submissionEnd : cycle.votingEnd;
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }

      const hoursRemaining = difference / (1000 * 60 * 60);

      if (hoursRemaining <= 36) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const formatted = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setTimeRemaining(formatted);
      } else {
        setTimeRemaining(formatDistanceToNow(targetDate));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [cycle, status]);

  const statusConfig = {
    submission: {
      label: "Submitting",
      description: "Submit papers for this cycle",
      color: "bg-primary text-primary-foreground",
    },
    voting: {
      label: "Voting",
      description: "Vote on submitted papers",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      description: "Results are in",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="relative border-1 border-muted bg-background">
        {/* Corner Accents */}
        <div
          className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`${config.color} px-8 py-4 border-b-2 border-border`}>
          <div className="mono text-xs tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Cycle Number */}
            <div className="space-y-3 flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Cycle Number
              </div>
              <div className="mono text-6xl font-bold tabular-nums leading-none">
                {String(cycle.cycleNumber).padStart(2, "0")}
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-3 md:text-center flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-4xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>

            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="space-y-3 md:text-right flex flex-col justify-center">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time Remaining
                </div>
                <div className="mono text-4xl font-bold tabular-nums leading-none">
                  {timeRemaining}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Banner 2: Left Aligned
export function StatusBanner2({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const targetDate =
        status === "submission" ? cycle.submissionEnd : cycle.votingEnd;
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }

      const hoursRemaining = difference / (1000 * 60 * 60);

      if (hoursRemaining <= 36) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const formatted = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setTimeRemaining(formatted);
      } else {
        setTimeRemaining(formatDistanceToNow(targetDate));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [cycle, status]);

  const statusConfig = {
    submission: {
      label: "Submitting",
      description: "Submit papers for this cycle",
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      description: "Vote on submitted papers",
      color: "bg-transparent text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      description: "Results are in",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative border-1 border-muted bg-background">
        {/* Overflow container for background number only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Background Cycle Number */}
          <div
            className={`absolute -bottom-10 sm:-bottom-13 -left-14 select-none text-blue-300/20`}
            aria-hidden="true"
          >
            <div className="mono text-[16rem] sm:text-[20rem] font-bold leading-none tabular-nums tracking-tight">
              {String(1).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -top-0.5 -left-0.5 w-8 h-8 border-t-2 border-l-2 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -top-0.5 -right-0.5 w-8 h-8 border-t-2 border-r-2 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-2 border-l-2 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-2 border-r-2 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Main Content */}
        <div className="px-6 py-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Current Status */}
            <div className="flex flex-col justify-center gap-2 text-left col-span-2">
              <div className="flex flex-col justify-center">
                <div className="mono text-sm tracking-[0.3em] uppercase opacity-60">
                  Status
                </div>
                <div className="mono text-5xl font-bold tracking-wider uppercase">
                  {config.label}
                </div>
              </div>
              {/* Time Remaining */}
              {status !== "completed" && (
                <div className="flex flex-col justify-center">
                  <div className="mono text-sm tracking-[0.3em] uppercase opacity-60">
                    Time Remaining
                  </div>
                  <div className="mono text-5xl font-bold tabular-nums leading-none">
                    {timeRemaining}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// NOTE: Banner 3 (Ticker), Banner 4, Final3, Final4, and other variants would continue here...
// This is a representative sample. The full archive would include all iterations.
