"use client";

import {
  finishVoteAndPause,
  finishVoteAndStartNext,
  scheduleCycle,
  startCycleNow,
} from "@/actions/admin.actions";
import ChapterSection from "@/components/ChapterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cycle, CycleStatus, Group } from "@/db/types";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface AdminPanelProps {
  groupId: Group["id"];
  currentCycle: Cycle | null;
  cycleStatus: CycleStatus | null;
}

type ActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

export function AdminPanel({
  groupId,
  currentCycle,
  cycleStatus,
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [cadenceDays, setCadenceDays] = useState(14);
  const [votingDays, setVotingDays] = useState(3);
  const [scheduledDate, setScheduledDate] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const submissionDays = cadenceDays - votingDays;

  // Handler for Start Cycle Now
  const handleStartNow = async () => {
    if (!password) {
      alert("Please enter admin password");
      return;
    }
    setPendingAction("start-now");
    const result = await startCycleNow(
      password,
      groupId,
      cadenceDays,
      votingDays
    );
    setPendingAction(null);
    if (result.success) {
      alert("Cycle started successfully!");
      setPassword("");
    } else {
      alert(result.error || "Failed to start cycle");
    }
  };

  // Handler for Schedule Cycle
  const handleSchedule = async () => {
    if (!password) {
      alert("Please enter admin password");
      return;
    }
    if (!scheduledDate) {
      alert("Please select a start date");
      return;
    }
    setPendingAction("schedule");
    const result = await scheduleCycle(
      password,
      groupId,
      new Date(scheduledDate),
      cadenceDays,
      votingDays
    );
    setPendingAction(null);
    if (result.success) {
      alert("Cycle scheduled successfully!");
      setPassword("");
      setScheduledDate("");
    } else {
      alert(result.error || "Failed to schedule cycle");
    }
  };

  // Handler for Finish Vote and Start Next
  const handleFinishAndStart = async () => {
    if (!password) {
      alert("Please enter admin password");
      return;
    }
    setPendingAction("finish-start");
    const result = await finishVoteAndStartNext(
      password,
      groupId,
      cadenceDays,
      votingDays
    );
    setPendingAction(null);
    if (result.success) {
      alert("Vote finished and next cycle started!");
      setPassword("");
    } else {
      alert(result.error || "Failed to finish vote and start next cycle");
    }
  };

  // Handler for Finish Vote and Pause
  const handleFinishAndPause = async () => {
    if (!password) {
      alert("Please enter admin password");
      return;
    }
    setPendingAction("finish-pause");
    const result = await finishVoteAndPause(password, groupId);
    setPendingAction(null);
    if (result.success) {
      alert("Vote finished successfully!");
      setPassword("");
    } else {
      alert(result.error || "Failed to finish vote");
    }
  };

  const isVotingPhase = cycleStatus === "voting";
  const hasActiveCycle = currentCycle && cycleStatus !== "completed";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-background backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="space-y-3">
            <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Administration
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Cycle Management
            </h1>
            <p className="font-serif text-foreground/80 max-w-xl font-medium">
              Control cycle timing, voting periods, and manage the reading club
              workflow.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-20">
          {/* Current Cycle Status */}
          <ChapterSection chapter="/01 Current Status">
            <div className="bg-background border-2 border-border p-8 rounded-xs space-y-4">
              {currentCycle ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium mb-2">
                        Cycle Number
                      </div>
                      <div className="text-2xl font-bold">
                        #{currentCycle.cycleNumber}
                      </div>
                    </div>
                    <div>
                      <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium mb-2">
                        Status
                      </div>
                      <div className="text-2xl font-bold capitalize">
                        {cycleStatus}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium mb-2">
                      Timeline
                    </div>
                    <div className="font-serif text-sm space-y-1">
                      <div>
                        Submission:{" "}
                        {new Date(
                          currentCycle.submissionStart
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          currentCycle.submissionEnd
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        Voting:{" "}
                        {new Date(
                          currentCycle.votingStart
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(currentCycle.votingEnd).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mono text-sm text-foreground/60">
                    No active cycle
                  </div>
                </div>
              )}
            </div>
          </ChapterSection>

          {/* Cycle Configuration */}
          <ChapterSection
            chapter="/02 Cycle Configuration"
            subtitle="Set Timing Parameters"
            description="Configure the duration of each cycle phase. Submission period is automatically calculated as total cadence minus voting days."
          >
            <div className="bg-background border-2 border-border p-8 rounded-xs space-y-8">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="mono text-sm font-medium">
                  Admin Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="font-mono"
                />
              </div>

              {/* Cadence Days */}
              <div className="space-y-2">
                <Label
                  htmlFor="cadenceDays"
                  className="mono text-sm font-medium"
                >
                  Total Cadence (days) *
                </Label>
                <Input
                  id="cadenceDays"
                  type="number"
                  min={1}
                  value={cadenceDays}
                  onChange={(e) =>
                    setCadenceDays(parseInt(e.target.value) || 0)
                  }
                  className="font-mono"
                />
                <p className="text-xs font-serif text-foreground/60">
                  Total duration of one complete cycle
                </p>
              </div>

              {/* Voting Days */}
              <div className="space-y-2">
                <Label
                  htmlFor="votingDays"
                  className="mono text-sm font-medium"
                >
                  Voting Period (days) *
                </Label>
                <Input
                  id="votingDays"
                  type="number"
                  min={1}
                  max={cadenceDays - 1}
                  value={votingDays}
                  onChange={(e) => setVotingDays(parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
                <p className="text-xs font-serif text-foreground/60">
                  Duration of the voting phase
                </p>
              </div>

              {/* Calculated Submission Days */}
              <div className="bg-muted/50 p-4 rounded-xs border border-border">
                <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium mb-2">
                  Calculated Values
                </div>
                <div className="font-mono text-sm">
                  Submission Period:{" "}
                  <span className="font-bold">{submissionDays}</span> days
                </div>
                {submissionDays <= 0 && (
                  <p className="text-xs text-destructive font-serif mt-2">
                    Warning: Voting days must be less than total cadence days
                  </p>
                )}
              </div>
            </div>
          </ChapterSection>

          {/* Create New Cycle */}
          {!hasActiveCycle && (
            <ChapterSection
              chapter="/03 Create New Cycle"
              subtitle="Start or Schedule"
              description="Begin a new cycle immediately or schedule it for a future date."
            >
              <div className="space-y-4">
                {/* Start Now */}
                <div className="bg-background border-2 border-border p-6 rounded-xs">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Start Cycle Now
                      </h3>
                      <p className="font-serif text-sm text-foreground/80">
                        Begin a new cycle immediately with the configured
                        parameters.
                      </p>
                    </div>
                    <Button
                      onClick={handleStartNow}
                      disabled={
                        !password ||
                        submissionDays <= 0 ||
                        pendingAction !== null
                      }
                      className="w-full mono font-medium"
                    >
                      {pendingAction === "start-now"
                        ? "Starting..."
                        : "Start Cycle Now"}
                    </Button>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-background border-2 border-border p-6 rounded-xs">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Schedule Cycle</h3>
                      <p className="font-serif text-sm text-foreground/80">
                        Schedule a cycle to start on a specific date in the
                        future.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="scheduledDate"
                        className="mono text-sm font-medium"
                      >
                        Start Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="font-mono"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                    <Button
                      onClick={handleSchedule}
                      disabled={
                        !password ||
                        !scheduledDate ||
                        submissionDays <= 0 ||
                        pendingAction !== null
                      }
                      variant="outline"
                      className="w-full mono font-medium"
                    >
                      {pendingAction === "schedule"
                        ? "Scheduling..."
                        : "Schedule Cycle"}
                    </Button>
                  </div>
                </div>
              </div>
            </ChapterSection>
          )}

          {/* Finish Voting Actions */}
          {isVotingPhase && (
            <ChapterSection
              chapter="/04 Finish Voting"
              subtitle="End Current Vote"
              description="Manually end the current voting period and optionally start the next cycle or pause."
            >
              <div className="space-y-4">
                {/* Finish and Start Next */}
                <div className="bg-background border-2 border-border p-6 rounded-xs">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Finish Vote & Start Next Cycle
                      </h3>
                      <p className="font-serif text-sm text-foreground/80">
                        Calculate results for the current vote and immediately
                        begin the next cycle with configured parameters.
                      </p>
                    </div>
                    <Button
                      onClick={handleFinishAndStart}
                      disabled={
                        !password ||
                        submissionDays <= 0 ||
                        pendingAction !== null
                      }
                      className="w-full mono font-medium"
                    >
                      {pendingAction === "finish-start"
                        ? "Processing..."
                        : "Finish & Start Next"}
                    </Button>
                  </div>
                </div>

                {/* Finish and Pause */}
                <div className="bg-background border-2 border-border p-6 rounded-xs">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Finish Vote & Pause
                      </h3>
                      <p className="font-serif text-sm text-foreground/80">
                        Calculate results for the current vote and pause without
                        creating a new cycle.
                      </p>
                    </div>
                    <Button
                      onClick={handleFinishAndPause}
                      disabled={!password || pendingAction !== null}
                      variant="outline"
                      className="w-full mono font-medium"
                    >
                      {pendingAction === "finish-pause"
                        ? "Processing..."
                        : "Finish & Pause"}
                    </Button>
                  </div>
                </div>
              </div>
            </ChapterSection>
          )}
        </div>
      </main>
    </div>
  );
}
