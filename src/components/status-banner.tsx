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
        setTimeRemaining(formatDistanceToNow(targetDate, { addSuffix: true }));
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
    <section className="max-w-4xl mx-auto py-6">
      <div className={`${config.color} border-y-2 border-border`}>
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="mono text-xs tracking-[0.2em] uppercase opacity-75">
                Cycle Number
              </div>
              <div className="mono text-3xl font-bold tabular-nums">
                {String(cycle.cycleNumber).padStart(2, "0")}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <div className="mono text-xs tracking-[0.2em] uppercase opacity-75">
                Current Status
              </div>
              <div className="mono text-3xl font-bold tracking-wide">
                {config.label}
              </div>
              {/* <div className="text-sm opacity-90">{config.description}</div> */}
            </div>

            {status !== "completed" && (
              <div className="space-y-2 text-right">
                <div className="mono text-xs tracking-[0.2em] uppercase opacity-75">
                  Time Remaining
                </div>
                <div className="mono text-3xl font-bold tabular-nums">
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
