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
