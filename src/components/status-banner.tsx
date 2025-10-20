"use client";

import type { Cycle, CycleStatus } from "@/db/types";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface StatusBannerProps {
  cycle: Cycle;
  status: CycleStatus;
  variant?: "default" | "compact" | "full";
}

export function StatusBanner({
  cycle,
  status,
  variant = "default",
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
    pending: {
      label: "Pending",
      color: "bg-muted text-foreground",
    },
  };

  const config = statusConfig[status];

  // Compact variant
  if (variant === "full") {
    return (
      <section className="w-full md:max-w-4xl mx-auto p-6">
        <div className="relative bg-background">
          {/* Background number - SMALL */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -bottom-4 sm:-bottom-5 -left-8 select-none text-blue-300 opacity-[0.2]"
              aria-hidden="true"
            >
              <div className="mono text-[8rem] font-bold leading-none tabular-nums tracking-tight">
                {String(cycle.cycleNumber).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Corner Accents */}
          <div
            className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 border-foreground`}
          />
          <div
            className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 border-foreground`}
          />

          {/* Header Bar */}
          <div className={`relative ${config.color} px-6 py-2`}>
            <div className="mono text-[10px] tracking-[0.3em] uppercase">
              Cycle {String(cycle.cycleNumber).padStart(2, "0")} — Information
            </div>
          </div>

          {/* Main Content - Reduced padding */}
          <div className="relative px-6 py-4 border border-muted border-t-0 md:grid md:grid-cols-2">
            <div className="flex items-center justify-end md:justify-between gap-6 md:col-start-2">
              {status !== "completed" && (
                <>
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
                  <div className="flex flex-col justify-center">
                    <div className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                      Time Left
                    </div>
                    <div className="mono text-3xl font-bold tabular-nums">
                      {timeRemaining}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "compact") {
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
            className={`absolute -bottom-0.25 -left-0.25 w-6 h-6 border-b-2 border-l-2 z-20 border-foreground`}
          />
          <div
            className={`absolute -bottom-0.25 -right-0.25 w-6 h-6 border-b-2 border-r-2 z-20 border-foreground`}
          />

          {/* Header Bar */}
          <div className={`relative ${config.color} px-6 py-2`}>
            <div className="mono text-[10px] tracking-[0.3em] uppercase">
              Cycle {String(cycle.cycleNumber).padStart(2, "0")} — Information
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

  // Default variant
  return (
    <section className="w-full md:max-w-xl mx-auto p-6">
      <div className="relative bg-background">
        {/* Overflow container for background number only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Background Cycle Number */}
          <div
            className="absolute -bottom-10 sm:-bottom-13 -left-14 select-none text-blue-300/20"
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
