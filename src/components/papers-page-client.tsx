"use client";

import { triggerCycleRollover } from "@/actions/cycle.actions";
import { getExistingVote } from "@/actions/vote.actions";
import ChapterSection from "@/components/ChapterSection";
import { PaperSubmissionForm } from "@/components/paper-submission-form";
import { ResultsDisplay } from "@/components/results-display";
import { StatusBanner } from "@/components/status-banner";
import { SubmittedPapersList } from "@/components/submitted-papers-list";
import { TokenLogin } from "@/components/token-login";
import { Button } from "@/components/ui/button";
import { VotingForm } from "@/components/voting-form";
import type {
  Cycle,
  CycleResult,
  CycleStatus,
  Group,
  Participant,
  Submission,
  VoteRanking,
} from "@/db/types";
import { LogOut } from "lucide-react";
import { useEffect, useOptimistic, useRef, useState } from "react";

interface PapersPageClientProps {
  initialSubmissions: Array<Submission & { participant: Participant }>;
  cycle: Cycle | null;
  status: CycleStatus | null;
  pastResults: Array<
    CycleResult & {
      cycle: Cycle;
      winningSubmission: Submission & { participant: Participant };
    }
  >;
  maxRanks: number;
  groupId: Group["id"];
  currentSubmissionCount: number;
}

export function PapersPageClient({
  initialSubmissions,
  cycle,
  status,
  pastResults,
  maxRanks,
  groupId,
  currentSubmissionCount,
}: PapersPageClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [existingRankings, setExistingRankings] = useState<VoteRanking[]>([]);

  // Optimistic updates for submissions
  const [optimisticSubmissions, addOptimistic] = useOptimistic(
    initialSubmissions,
    (state, newSubmission: Submission & { participant: Participant }) => [
      newSubmission,
      ...state,
    ]
  );

  // Derive current user's submission count from optimistic submissions
  const userSubmissionCount = participant
    ? optimisticSubmissions.filter((s) => s.participantId === participant.id)
        .length
    : 0;

  // Load token from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("token");
    const storedParticipant = localStorage.getItem("participant");
    if (stored && storedParticipant) {
      setToken(stored);
      setParticipant(JSON.parse(storedParticipant));
    }
  }, []);

  // Fetch existing vote rankings when token and cycle are available
  useEffect(() => {
    async function fetchVote() {
      if (token && cycle && status === "voting") {
        const { rankings } = await getExistingVote(token, cycle.id, groupId);
        setExistingRankings(rankings);
      }
    }
    fetchVote();
  }, [token, cycle, groupId, status]);

  // Auto-refresh when submission ends and voting starts
  useEffect(() => {
    if (!cycle || status !== "submission") return;

    const submissionEnd = new Date(cycle.submissionEnd).getTime();
    const now = Date.now();
    const timeUntilEnd = submissionEnd - now;

    if (timeUntilEnd <= 0) {
      // Submission already ended
      return;
    }

    // Set timeout to refresh page when submission ends
    const timeoutId = setTimeout(() => {
      console.log("[Client] Submission ended, refreshing for voting phase...");
      window.location.reload();
    }, timeUntilEnd + 1000); // Add 1 second buffer

    return () => clearTimeout(timeoutId);
  }, [cycle, status]);

  // Auto-trigger rollover when voting countdown ends
  const rolloverTriggeredRef = useRef(false);
  useEffect(() => {
    if (!cycle || status !== "voting") {
      rolloverTriggeredRef.current = false;
      return;
    }

    const votingEnd = new Date(cycle.votingEnd).getTime();
    const now = Date.now();
    const timeUntilEnd = votingEnd - now;

    if (timeUntilEnd <= 0) {
      // Voting already ended
      return;
    }

    // Set timeout to trigger rollover when voting ends
    const timeoutId = setTimeout(async () => {
      if (!rolloverTriggeredRef.current) {
        rolloverTriggeredRef.current = true;
        console.log("[Client Rollover] Voting ended, triggering rollover...");
        const result = await triggerCycleRollover();
        if (result.success) {
          console.log("[Client Rollover] Success! Page will refresh.");
          // Page will auto-refresh from revalidation
        } else {
          console.log("[Client Rollover] Failed, cron will handle it.");
        }
      }
    }, timeUntilEnd + 1000); // Add 1 second buffer to ensure voting has ended

    return () => clearTimeout(timeoutId);
  }, [cycle, status]);

  const handleLogin = async (
    loginToken: string,
    loginParticipant: Participant
  ) => {
    setToken(loginToken);
    setParticipant(loginParticipant);
    localStorage.setItem("token", loginToken);
    localStorage.setItem("participant", JSON.stringify(loginParticipant));
  };

  const handleLogout = () => {
    setToken(null);
    setParticipant(null);
    localStorage.removeItem("token");
    localStorage.removeItem("participant");
  };

  const handleDeletePaper = async (id: Submission["id"]) => {
    // TODO: Implement delete paper server action
    console.log("Delete paper:", id);
  };

  const handleDataChange = () => {
    // Trigger a router refresh to get latest data
    window.location.reload();
  };

  const hasActiveCycle = cycle && status;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
                Paper Reading Club
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Bi-weekly Paper Selection
              </h1>
              <p className="font-serif text-foreground/80 max-w-xl font-medium">
                A collaborative space for discovering and voting on research
                papers using ranked-choice methodology.
              </p>
            </div>
            {token && participant && (
              <div className="flex items-center gap-6">
                <div className="text-right space-y-1">
                  <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
                    User
                  </div>
                  <div className="mono text-sm font-semibold uppercase">
                    {participant.firstName}
                    {participant.lastName && ` ${participant.lastName}`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="border-2 bg-transparent rounded-xs"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Status Banner - Only show if there's an active cycle */}
      {hasActiveCycle && (
        <>
          <StatusBanner cycle={cycle} status={status} variant="full" />
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-6 pb-16 max-w-4xl">
        <div className="space-y-20">
          {/* Active Cycle Sections */}
          {hasActiveCycle ? (
            <>
              {/* Submission/Voting Phase */}
              {status !== "completed" ? (
                <ChapterSection
                  chapter={
                    status === "submission"
                      ? "/01 Submission Phase"
                      : "/01 Voting Phase"
                  }
                >
                  {!token || !participant ? (
                    <TokenLogin
                      groupId={groupId}
                      variant="embedded"
                      onLogin={handleLogin}
                      status={status}
                    />
                  ) : status === "submission" && cycle ? (
                    <PaperSubmissionForm
                      token={token}
                      cycleId={cycle.id}
                      groupId={groupId}
                      participant={participant}
                      currentSubmissionCount={userSubmissionCount}
                      onOptimisticAdd={addOptimistic}
                      onDataChange={handleDataChange}
                    />
                  ) : status === "voting" && cycle ? (
                    <VotingForm
                      token={token}
                      cycleId={cycle.id}
                      groupId={groupId}
                      submissions={optimisticSubmissions}
                      maxRanks={maxRanks}
                      existingRankings={existingRankings}
                    />
                  ) : null}
                </ChapterSection>
              ) : (
                <ChapterSection chapter="/01 Cycle Closed">
                  <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
                    The club is closed. No more submissions or voting are
                    allowed. You can still view the past results.
                  </p>
                </ChapterSection>
              )}

              {/* Current Submissions */}
              <ChapterSection chapter="/02 Current Submissions">
                {optimisticSubmissions.length > 0 ? (
                  <SubmittedPapersList
                    submissions={optimisticSubmissions}
                    currentParticipant={participant || undefined}
                    onDelete={handleDeletePaper}
                  />
                ) : (
                  <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
                    No papers submitted yet.
                  </p>
                )}
              </ChapterSection>
            </>
          ) : (
            /* No Active Cycle Message */
            <ChapterSection chapter="/01 No Active Cycle">
              <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
                There&apos;s no active reading cycle at the moment. Browse past
                cycles below to see previous winning papers and results.
              </p>
            </ChapterSection>
          )}

          {/* Past Results - Always show if available */}
          {pastResults.length > 0 && (
            <ChapterSection
              chapter={hasActiveCycle ? "/03 Archive" : "/02 Archive"}
              subtitle="Past Results"
              description="Browse previous winning papers and results from past cycles."
            >
              <ResultsDisplay pastResults={pastResults} />
            </ChapterSection>
          )}
        </div>
      </main>
    </div>
  );
}
