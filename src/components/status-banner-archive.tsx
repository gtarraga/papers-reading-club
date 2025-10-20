/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface StatusBanner3Props extends StatusBannerProps {
  totalSubmissions: number;
  totalSubmitters: number;
}

/**
 * BANNER ARCHIVE
 *
 * This file contains all the banner design iterations created during the design exploration phase.
 * These are kept for archive purposes and reference but are not used in production.
 *
 * Active Banner in Production:
 * - StatusBanner (in status-banner.tsx) with variant="compact" and variant="default"
 *
 * Archived Variants (in order of creation):
 * 1. StatusBanner: Original three-column layout with large spacing
 * 2. StatusBanner2: Left-aligned with large background number
 * 3. StatusBanner3: Animated scrolling ticker with cycle stats
 * 4. StatusBanner4: Header bar with two-section layout
 * 5. StatusBanner5: Right-aligned design (became "default" variant)
 * 6. StatusBannerFinal1: Small watermark, compact (became "compact" variant)
 * 7. StatusBannerFinal1Sub: Submission-only state variant
 * 8. StatusBannerFinal2: Medium watermark
 * 9. StatusBannerFinal3: Balanced spacing variant
 * 10. StatusBannerFinal3Sub: Balanced spacing submission state
 * 11. StatusBannerFinal4: Bold typography variant
 * 12. StatusBannerFinal4Sub: Bold typography submission state
 * 13. StatusBanner4Horizontal: Single-line horizontal layout
 * 14. StatusBanner5Compact: Inline right-aligned
 * 15. StatusBanner5CompactSmall: Small watermark inline
 * 16. StatusBannerFinal5: Centered layout variant
 * 17. StatusBanner5CompactMinimal: Minimal no-header design
 * 18. StatusBanner5Minimal: Minimal with status badge
 */

// ============================================================================
// ORIGINAL BANNER 1: Three-Column Layout
// ============================================================================
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

      // Show countdown format only when 36 hours or less remain
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
        // Show human-readable format for more than 36 hours
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

// ============================================================================
// BANNER 2: Left-Aligned with Large Background Number
// ============================================================================
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

      // Show countdown format only when 36 hours or less remain
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
        // Show human-readable format for more than 36 hours
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
            className={`absolute -bottom-10 sm:-bottom-13 -right-6 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.2]"
            }`}
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

// ============================================================================
// BANNER 3: Animated Scrolling Ticker
// ============================================================================
export function StatusBanner3({
  cycle,
  status,
  totalSubmissions,
  totalSubmitters,
}: StatusBanner3Props) {
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

      // Show countdown format only when 36 hours or less remain
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
        // Show human-readable format for more than 36 hours
        setTimeRemaining(formatDistanceToNow(targetDate));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [cycle, status]);

  const statusConfig = {
    submission: {
      label: "SUBMITTING",
      description: "Submit papers for this cycle",
    },
    voting: {
      label: "VOTING",
      description: "Vote on submitted papers",
    },
    completed: {
      label: "CYCLE COMPLETE",
      description: "Results are in",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full">
      <div className="relative bg-background text-foreground overflow-hidden border-b-2 border-foreground">
        {/* Scrolling Ticker */}
        <div className="relative py-4">
          <div className="flex animate-scroll whitespace-nowrap">
            {/* Duplicate content for seamless loop */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="inline-flex items-center">
                <span className="mono text-xl sm:text-2xl font-bold tracking-[0.2em] px-3">
                  • CYCLE{" "}
                  <span className=" px-2 -mx-1">
                    {String(cycle.cycleNumber).padStart(2, "0")}
                  </span>{" "}
                  •{" "}
                  <span className="bg-primary text-primary-foreground px-2 -mx-1">
                    {config.label}
                  </span>{" "}
                  • SUBMISSIONS:{" "}
                  <span className=" px-2 -mx-1 tabular-nums">
                    {totalSubmissions}
                  </span>{" "}
                  • PARTICIPANTS:{" "}
                  <span className=" px-2 -mx-1 tabular-nums">
                    {totalSubmitters}
                  </span>
                  {status !== "completed" && (
                    <>
                      {" "}
                      • TIME REMAINING:{" "}
                      <span className="bg-primary text-primary-foreground px-2 -mx-1 tabular-nums">
                        {timeRemaining}
                      </span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-l from-background to-transparent" />
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// ============================================================================
// BANNER 4: Header Bar with Two-Section Layout
// ============================================================================
export function StatusBanner4({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const targetDate =
        status === "submission" ? cycle.submissionEnd : cycle.votingEnd;
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining("00:00:00");
        setProgress(100);
        return;
      }

      // Calculate progress (assuming 14 days total for each phase)
      const totalDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      const elapsed = totalDuration - difference;
      const progressPercent = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100)
      );
      setProgress(progressPercent);

      const hoursRemaining = difference / (1000 * 60 * 60);

      // Show countdown format only when 36 hours or less remain
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
        // Show human-readable format for more than 36 hours
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
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Overflow container for background number only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Background Cycle Number */}
          <div
            className={`absolute -bottom-10 sm:-bottom-13 -left-14 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.2]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[16rem] sm:text-[20rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-8 h-8 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-8 h-8 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-8 py-3`}>
          <div className="mono text-xs tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-8 py-6 border border-muted border-t-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Cycle Number */}
            <div className="space-y-3 flex-col justify-center hidden sm:flex">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Cycle Number
              </div>
              <div className="mono text-6xl font-bold tabular-nums leading-none">
                {String(cycle.cycleNumber).padStart(2, "0")}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 text-right col-span-2">
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

// ============================================================================
// BANNER 5: Right-Aligned Design (Original, became "default" variant)
// ============================================================================
export function StatusBanner5({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const targetDate =
        status === "submission" ? cycle.submissionEnd : cycle.votingEnd;
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining("00:00:00");
        setProgress(100);
        return;
      }

      // Calculate progress (assuming 14 days total for each phase)
      const totalDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      const elapsed = totalDuration - difference;
      const progressPercent = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100)
      );
      setProgress(progressPercent);

      const hoursRemaining = difference / (1000 * 60 * 60);

      // Show countdown format only when 36 hours or less remain
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
        // Show human-readable format for more than 36 hours
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
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Overflow container for background number only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Background Cycle Number */}
          <div
            className={`absolute -bottom-10 sm:-bottom-13 -left-14 select-none text-blue-300/20`}
            aria-hidden="true"
          >
            <div className="mono text-[16rem] sm:text-[20rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-8 h-8 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-8 h-8 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-8 py-3`}>
          <div className="mono text-xs tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-8 py-6 border border-muted border-t-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Cycle Number */}
            <div className="space-y-3 flex-col justify-center hidden">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Cycle Number
              </div>
              <div className="mono text-6xl font-bold tabular-nums leading-none">
                {String(cycle.cycleNumber).padStart(2, "0")}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 text-right col-span-2 col-start-2">
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

// ============================================================================
// FINAL VARIANTS - Compact Designs
// ============================================================================

// Final 1: Small Watermark (became "compact" variant)
export function StatusBannerFinal1({ cycle, status }: StatusBannerProps) {
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
      color: "bg-primary text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - SMALL */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[6rem] sm:text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - Reduced padding */}
        <div className="relative px-6 py-4 border border-muted border-t-0">
          <div className="flex items-center justify-end gap-6">
            {/* Status */}
            <div className="flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex flex-col justify-center">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time Left
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// Final 1 Sub: Submission State Variant
export function StatusBannerFinal1Sub({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const targetDate = cycle.submissionEnd; // Always use submission end
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
  }, [cycle]);

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - SMALL */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[6rem] sm:text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 border-foreground" />
        <div className="absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 border-foreground" />

        {/* Header Bar - Always Submission */}
        <div className="relative bg-primary text-primary-foreground px-6 py-2">
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — Submitting
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-6 py-4 border border-muted border-t-0">
          <div className="flex items-center justify-end gap-6">
            {/* Status */}
            <div className="flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                Submitting
              </div>
            </div>
            {/* Time Remaining */}
            <div className="flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Time Left
              </div>
              <div className="mono text-3xl font-bold tabular-nums leading-none">
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final 2: Medium Watermark
export function StatusBannerFinal2({ cycle, status }: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-6 sm:-bottom-8 -left-10 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.15]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[10rem] sm:text-[14rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - Reduced padding */}
        <div className="relative px-6 py-4 border border-muted border-t-0">
          <div className="flex items-center justify-end gap-6">
            {/* Status */}
            <div className="flex flex-col justify-center">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex flex-col justify-center">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time Left
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// Final 3: Balanced Spacing Variant
export function StatusBannerFinal3({ cycle, status }: StatusBannerProps) {
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
      color: "bg-primary text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - small and subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[6rem] sm:text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar - balanced spacing */}
        <div className={`relative ${config.color} px-6 py-2`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - balanced spacing */}
        <div className="relative px-6 py-3.5 border border-muted border-t-0">
          <div className="flex items-center justify-end gap-8">
            {/* Status */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex flex-col justify-center gap-1">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time Left
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// Final 3 Sub: Balanced Spacing Submission State
export function StatusBannerFinal3Sub({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const targetDate = cycle.submissionEnd; // Always use submission end
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
  }, [cycle]);

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - small and subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[6rem] sm:text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 border-foreground" />
        <div className="absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 border-foreground" />

        {/* Header Bar - Always Submission */}
        <div className="relative bg-primary text-primary-foreground px-6 py-2">
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — Submitting
          </div>
        </div>

        {/* Main Content - balanced spacing */}
        <div className="relative px-6 py-3.5 border border-muted border-t-0">
          <div className="flex items-center justify-end gap-8">
            {/* Status */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                Submitting
              </div>
            </div>
            {/* Time Remaining */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Time Left
              </div>
              <div className="mono text-3xl font-bold tabular-nums leading-none">
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final 4: Bold Typography Variant
export function StatusBannerFinal4({ cycle, status }: StatusBannerProps) {
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
      color: "bg-primary text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - medium bold */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-6 sm:-bottom-8 -left-10 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[10rem] sm:text-[14rem] font-black leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents - thicker */}
        <div
          className={`absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-[3px] border-l-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-[3px] border-r-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2.5`}>
          <div className="mono text-[10px] tracking-[0.35em] uppercase font-bold">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-6 py-4 border-2 border-muted border-t-0">
          <div className="flex items-center justify-end gap-6">
            {/* Status */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.35em] uppercase opacity-70 font-semibold">
                Status
              </div>
              <div className="mono text-4xl font-black tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex flex-col justify-center gap-1">
                <div className="mono text-[10px] tracking-[0.35em] uppercase opacity-70 font-semibold">
                  Time Left
                </div>
                <div className="mono text-4xl font-black tabular-nums leading-none">
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

// Final 4 Sub: Bold Typography Submission State
export function StatusBannerFinal4Sub({ cycle, status }: StatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const targetDate = cycle.submissionEnd; // Always use submission end
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
  }, [cycle]);

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - medium bold */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -bottom-6 sm:-bottom-8 -left-10 select-none text-blue-300 opacity-[0.2]"
            aria-hidden="true"
          >
            <div className="mono text-[10rem] sm:text-[14rem] font-black leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents - thicker */}
        <div className="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-[3px] border-l-[3px] z-20 border-foreground" />
        <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-[3px] border-r-[3px] z-20 border-foreground" />

        {/* Header Bar - Always Submission */}
        <div className="relative bg-primary text-primary-foreground px-6 py-2.5">
          <div className="mono text-[10px] tracking-[0.35em] uppercase font-bold">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — Submitting
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-6 py-4 border-2 border-muted border-t-0">
          <div className="flex items-center justify-end gap-6">
            {/* Status */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.35em] uppercase opacity-70 font-semibold">
                Status
              </div>
              <div className="mono text-4xl font-black tracking-wider uppercase">
                Submitting
              </div>
            </div>
            {/* Time Remaining */}
            <div className="flex flex-col justify-center gap-1">
              <div className="mono text-[10px] tracking-[0.35em] uppercase opacity-70 font-semibold">
                Time Left
              </div>
              <div className="mono text-4xl font-black tabular-nums leading-none">
                {timeRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final 5: Centered Layout Variant
export function StatusBannerFinal5({ cycle, status }: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - centered */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.12]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[8rem] sm:text-[10rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2 text-center`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - centered */}
        <div className="relative px-6 py-3 border border-muted border-t-0">
          <div className="flex items-baseline justify-center gap-6">
            {/* Status */}
            <div className="flex items-baseline gap-2">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex items-baseline gap-2">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// ============================================================================
// ADDITIONAL COMPACT VARIANTS
// ============================================================================

// Banner 4 Horizontal: Single-Line Layout
export function StatusBanner4Horizontal({ cycle, status }: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - smaller and more subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-4 -right-6 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.12]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-5 h-5 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-5 h-5 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Single Bar Layout - everything in one line */}
        <div className="relative border border-muted">
          <div
            className={`${config.color} px-6 py-3 flex items-center justify-between gap-4 flex-wrap`}
          >
            <div className="mono text-[10px] tracking-[0.3em] uppercase">
              Cycle {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
            <div className="mono text-2xl font-bold tracking-wider uppercase">
              {config.label}
            </div>
            {status !== "completed" && (
              <div className="mono text-2xl font-bold tabular-nums">
                {timeRemaining}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Banner 5 Compact: Inline Right-Aligned
export function StatusBanner5Compact({ cycle, status }: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-6 sm:-bottom-8 -left-10 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.15]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[10rem] sm:text-[14rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - More compact, right-aligned */}
        <div className="relative px-6 py-3 border border-muted border-t-0">
          <div className="flex items-baseline justify-end gap-4">
            {/* Status */}
            <div className="flex items-baseline gap-2">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex items-baseline gap-2">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// Banner 5 Compact Small: Small Watermark Inline
export function StatusBanner5CompactSmall({
  cycle,
  status,
}: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background">
        {/* Background number - SMALL */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.03]" : "opacity-[0.12]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[6rem] sm:text-[8rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div
          className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Header Bar */}
        <div className={`relative ${config.color} px-6 py-2`}>
          <div className="mono text-[10px] tracking-[0.3em] uppercase">
            Cycle {String(cycle.cycleNumber).padStart(2, "0")} — {config.label}
          </div>
        </div>

        {/* Main Content - More compact, right-aligned */}
        <div className="relative px-6 py-3 border border-muted border-t-0">
          <div className="flex items-baseline justify-end gap-4">
            {/* Status */}
            <div className="flex items-baseline gap-2">
              <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                Status
              </div>
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
            </div>
            {/* Time Remaining */}
            {status !== "completed" && (
              <div className="flex items-baseline gap-2">
                <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                  Time
                </div>
                <div className="mono text-3xl font-bold tabular-nums leading-none">
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

// Banner 5 Compact Minimal: No Header, Vertical Divider
export function StatusBanner5CompactMinimal({
  cycle,
  status,
}: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background border border-muted">
        {/* Background number - very subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-4 -left-6 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.02]" : "opacity-[0.08]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[7rem] sm:text-[9rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Corner Accents - small but strong */}
        <div
          className={`absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-[3px] border-l-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-[3px] border-r-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Single section - no header */}
        <div className="relative px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-50">
              Cycle {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
            <div className="flex items-baseline gap-3">
              <div className="mono text-3xl font-bold tracking-wider uppercase">
                {config.label}
              </div>
              <div className="w-px h-8 bg-border" />
              {status !== "completed" && (
                <div className="mono text-3xl font-bold tabular-nums">
                  {timeRemaining}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Banner 5 Minimal: Status Badge
export function StatusBanner5Minimal({ cycle, status }: StatusBannerProps) {
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
      color: "bg-background text-primary-foreground",
    },
    voting: {
      label: "Voting",
      color: "bg-primary text-primary-foreground",
    },
    completed: {
      label: "Cycle Complete",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <section className="w-full md:max-w-lg mx-auto p-6">
      <div className="relative bg-background border border-muted">
        {/* Background number - very subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -bottom-4 -left-8 select-none text-blue-300 ${
              status === "completed" ? "opacity-[0.02]" : "opacity-[0.1]"
            }`}
            aria-hidden="true"
          >
            <div className="mono text-[9rem] font-bold leading-none tabular-nums tracking-tight">
              {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Stronger corner accents for anchoring */}
        <div
          className={`absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] z-20 ${
            status === "completed"
              ? "border-muted-foreground/40"
              : "border-foreground"
          }`}
        />

        {/* Minimal single section */}
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="mono text-xs tracking-[0.3em] uppercase opacity-60">
              Cycle {String(cycle.cycleNumber).padStart(2, "0")}
            </div>
            <div className="flex items-baseline gap-3">
              <div
                className={`mono text-2xl font-bold tracking-wider uppercase ${config.color} px-3 py-1`}
              >
                {config.label}
              </div>
              {status !== "completed" && (
                <div className="mono text-2xl font-bold tabular-nums">
                  {timeRemaining}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
