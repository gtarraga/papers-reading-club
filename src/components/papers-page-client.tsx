"use client";

import { PaperSubmissionForm } from "@/components/paper-submission-form";
import { StatusBanner } from "@/components/status-banner";
import { SubmittedPapersList } from "@/components/submitted-papers-list";
import { TokenLogin } from "@/components/token-login";
import { Button } from "@/components/ui/button";
import { VotingForm } from "@/components/voting-form";
import {
  deletePaper,
  getCurrentCycle,
  getCurrentUser,
  getPastResults,
  loginWithToken,
  logout,
  type Cycle,
  type PastResult,
  type Submission,
  type User,
} from "@/lib/mock-backend";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import ChapterSection from "./ChapterSection";

type CycleStatus = "submission" | "voting" | "completed";

function getCycleStatus(cycle: Cycle): CycleStatus {
  const now = new Date();
  if (now < cycle.submissionEnd) return "submission";
  if (now < cycle.votingEnd) return "voting";
  return "completed";
}

export function PapersPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [pastResults, setPastResults] = useState<PastResult[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadData();
    }
  }, []);

  const loadData = () => {
    const currentCycle = getCurrentCycle();
    setCycle(currentCycle);
    // Sort submissions by newest first
    const sortedSubmissions = [...currentCycle.submissions].sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
    setSubmissions(sortedSubmissions);
    setPastResults(getPastResults());
  };

  const handleDeletePaper = async (id: string) => {
    if (!user) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    const success = deletePaper(id, user.id);
    if (success) {
      loadData();
    }
  };

  const handleLogin = (token: string) => {
    const loggedInUser = loginWithToken(token);
    if (loggedInUser) {
      setUser(loggedInUser);
      setLoginError("");
      loadData();
    } else {
      setLoginError("Invalid token. Please try again.");
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCycle(null);
    setPastResults([]);
  };

  if (!user || !cycle) {
    return (
      <>
        <TokenLogin onLogin={handleLogin} />
        {loginError && (
          <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-xs font-mono text-sm">
            {loginError}
          </div>
        )}
      </>
    );
  }

  const status = getCycleStatus(cycle);

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
                <div className="mono text-sm font-semibold">{user.name}</div>
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

      {/* Status Banner */}
      <StatusBanner cycle={cycle} status={status} variant="compact" />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-20">
          {/* Submission Phase */}
          {status !== "completed" ? (
            <ChapterSection
              chapter={
                status === "submission"
                  ? "/01 Submission Phase"
                  : "/01 Voting Phase"
              }
            >
              {status === "submission" ? (
                <PaperSubmissionForm user={user} onDataChange={loadData} />
              ) : (
                <VotingForm user={user} />
              )}
            </ChapterSection>
          ) : (
            <ChapterSection chapter="/01 Cycle Closed">
              <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
                The club is closed. No more submissions or voting are allowed.
                You can still view the past results.
              </p>
            </ChapterSection>
          )}

          {/* Current Submissions */}
          <ChapterSection chapter="/02 Current Submissions">
            {submissions.length > 0 ? (
              <SubmittedPapersList
                submissions={submissions}
                user={user}
                onDelete={handleDeletePaper}
              />
            ) : (
              <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
                No papers submitted yet.
              </p>
            )}
          </ChapterSection>

          {/* Past Results */}
          {pastResults.length > 0 && (
            <ChapterSection
              chapter="/03 Archive"
              subtitle="Past Cycles"
              description="Browse previous winning papers and results from past cycles. See voting patterns and explore papers that resonated with the group."
            >
              {/* <ResultsDisplay pastResults={pastResults} /> */}
              <></>
            </ChapterSection>
          )}
        </div>
      </main>
    </div>
  );
}
