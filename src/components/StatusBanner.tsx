"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Cycle, CycleStatus } from "@/db/types";
import { cn } from "@/utils/cn";
import { formatDuration, intervalToDuration, type Duration } from "date-fns";
import { useEffect, useState } from "react";

interface StatusBannerProps {
  cycle: Cycle;
  status: CycleStatus;
  endDate: Date;
}

export function StatusBanner({ cycle, status, endDate }: StatusBannerProps) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      if (now >= endDate) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const duration = intervalToDuration({
        start: now,
        end: endDate,
      });
      setTimeLeft(duration);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const formatted = timeLeft
    ? formatDuration(timeLeft, {
        format: ["days", "hours", "minutes"],
        delimiter: ", ",
      })
    : "Calculating...";

  const statusLabel =
    status === "submission"
      ? "Submission Phase"
      : status === "voting"
      ? "Voting Phase"
      : status === "completed"
      ? "Cycle Complete"
      : status === "pending"
      ? "Pending Start"
      : "Cycle Closed";

  const statusVariant =
    status === "submission"
      ? "default"
      : status === "voting"
      ? "secondary"
      : "outline";

  return (
    <Card className={cn("p-6 bg-stone-50 border-black")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-mono font-bold">
            Cycle {cycle.cycleNumber}
          </h1>
          <Badge variant={statusVariant} className="font-mono">
            {statusLabel}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-sm font-serif text-stone-600">Time remaining</p>
          <p className="text-2xl font-mono font-semibold">
            {formatted || "Ended"}
          </p>
        </div>
      </div>
    </Card>
  );
}
