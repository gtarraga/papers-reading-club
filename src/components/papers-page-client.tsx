"use client";

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
  Vote,
} from "@/db/types";
import { LogOut } from "lucide-react";
import { useEffect, useOptimistic, useState } from "react";
import { NowReadingBanner } from "./now-reading-banner";

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
  existingVote?: Vote | null;
  currentSubmissionCount: number;
}

export function PapersPageClient({
  initialSubmissions,
  cycle,
  status,
  pastResults,
  maxRanks,
  groupId,
  existingVote,
  currentSubmissionCount,
}: PapersPageClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loginError, setLoginError] = useState("");

  // Optimistic updates for submissions
  const [optimisticSubmissions, addOptimistic] = useOptimistic(
    initialSubmissions,
    (state, newSubmission: Submission & { participant: Participant }) => [
      newSubmission,
      ...state,
    ]
  );

  useEffect(() => {
    const stored = localStorage.getItem("token");
    const storedParticipant = localStorage.getItem("participant");
    if (stored && storedParticipant) {
      setToken(stored);
      setParticipant(JSON.parse(storedParticipant));
    }
  }, []);

  const handleLogin = async (
    loginToken: string,
    loginParticipant: Participant
  ) => {
    setToken(loginToken);
    setParticipant(loginParticipant);
    localStorage.setItem("token", loginToken);
    localStorage.setItem("participant", JSON.stringify(loginParticipant));
    setLoginError("");
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

  if (!token || !participant) {
    return (
      <>
        <TokenLogin groupId={groupId} onLogin={handleLogin} />
        {loginError && (
          <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-xs font-mono text-sm">
            {loginError}
          </div>
        )}
      </>
    );
  }

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
          </div>
        </div>
      </header>

      {/* Status Banner - Only show if there's an active cycle */}
      {hasActiveCycle && (
        <>
          <StatusBanner cycle={cycle} status={status} variant="compact" />
          <StatusBanner cycle={cycle} status={status} variant="default" />
        </>
      )}
      <NowReadingBanner currentPaper={pastResults[0]} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
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
                  {status === "submission" && token && cycle ? (
                    <PaperSubmissionForm
                      token={token}
                      cycleId={cycle.id}
                      groupId={groupId}
                      participant={participant!}
                      currentSubmissionCount={currentSubmissionCount}
                      onOptimisticAdd={addOptimistic}
                      onDataChange={handleDataChange}
                    />
                  ) : status === "voting" && token && cycle ? (
                    <VotingForm
                      token={token}
                      cycleId={cycle.id}
                      groupId={groupId}
                      participant={participant!}
                      submissions={optimisticSubmissions}
                      maxRanks={maxRanks}
                      existingVote={existingVote}
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
                    currentParticipant={participant!}
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
                There's no active reading cycle at the moment. Browse past
                cycles below to see previous winning papers and results.
              </p>
            </ChapterSection>
          )}

          {/* Past Results - Always show if available */}
          {pastResults.length > 0 && (
            <ChapterSection
              chapter={hasActiveCycle ? "/03 Archive" : "/02 Archive"}
              subtitle="Past Cycles"
              description="Browse previous winning papers and results from past cycles. See voting patterns and explore papers that resonated with the group."
            >
              <ResultsDisplay pastResults={pastResults} />
            </ChapterSection>
          )}
        </div>
      </main>
    </div>
  );
}
