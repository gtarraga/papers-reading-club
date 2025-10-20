"use client";

import { submitVote } from "@/actions/vote.actions";
import PaperSubmission from "@/components/PaperSubmission";
import { VotingChoiceSlot } from "@/components/VotingChoiceSlot";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import type {
  Cycle,
  Group,
  Participant,
  Submission,
  VoteRanking,
} from "@/db/types";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

// Helper function to get ordinal word (first, second, third, etc.)
function getOrdinalWord(n: number): string {
  const words = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
  ];
  return words[n - 1] || `${n}th`;
}

interface VotingFormProps {
  token: string;
  cycleId: Cycle["id"];
  groupId: Group["id"];
  submissions: Array<Submission & { participant: Participant }>;
  maxRanks: number;
  existingRankings?: VoteRanking[];
}

export function VotingForm({
  token,
  cycleId,
  groupId,
  submissions,
  maxRanks,
  existingRankings = [],
}: VotingFormProps) {
  // Dynamic array of choices based on maxRanks
  const [choices, setChoices] = useState<(Submission | null)[]>(
    Array(maxRanks).fill(null)
  );
  const [selectingFor, setSelectingFor] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Load existing rankings into choices and set hasVoted
  useEffect(() => {
    if (existingRankings.length > 0) {
      const initialChoices = Array(maxRanks).fill(null);

      // Map rankings to choices array by rank
      for (const ranking of existingRankings) {
        const submission = submissions.find(
          (s) => s.id === ranking.submissionId
        );
        if (submission && ranking.rank <= maxRanks) {
          initialChoices[ranking.rank - 1] = submission;
        }
      }

      setChoices(initialChoices);
      setHasVoted(true);
    }
  }, [existingRankings, submissions, maxRanks]);

  const handleSelectSubmission = (submission: Submission) => {
    if (selectingFor !== null) {
      const newChoices = [...choices];
      newChoices[selectingFor] = submission;
      setChoices(newChoices);
    }
    setSelectingFor(null);
  };

  const handleClearChoice = (index: number) => {
    const newChoices = [...choices];
    newChoices[index] = null;
    setChoices(newChoices);
  };

  const getAvailableSubmissions = () => {
    const selectedIds = choices
      .filter((choice): choice is Submission => choice !== null)
      .map((choice) => choice.id);
    return submissions.filter((s) => !selectedIds.includes(s.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const rankings: Array<{ submissionId: Submission["id"]; rank: number }> =
        [];

      // Build rankings from non-null choices
      choices.forEach((choice, index) => {
        if (choice) {
          rankings.push({ submissionId: choice.id, rank: index + 1 });
        }
      });

      const result = await submitVote(token, cycleId, groupId, rankings);

      if (result.success) {
        setHasVoted(true);
      } else {
        setError(result.error || "Failed to submit vote");
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = choices.some((choice) => choice !== null);

  if (hasVoted) {
    return (
      <div className="space-y-2 mono text-center uppercase">
        {/* <h3 className="mono text-2xl font-bold tracking-tight">
          Vote Submitted
        </h3> */}
        <div className="space-y-4">
          <h4 className="text-base tracking-[0.2em] uppercase text-foreground/80 font-medium">
            Your Vote
          </h4>
          <div className="space-y-2">
            {choices.map((choice, index) => {
              if (!choice) return null;
              return (
                <div key={choice.id} className="text-sm text-foreground/70">
                  <span className="font-bold">{index + 1}.</span>{" "}
                  <a
                    href={choice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline decoration-primary decoration-3 underline-offset-1"
                  >
                    <span>{choice.title}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Vote on Papers</h2>
        <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
          Rank papers in order of preference. Winner will be determined using
          instant runoff voting, for the most preferred paper by the group.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-0 border-1 border-foreground rounded-xs overflow-hidden">
          {choices.map((choice, index) => (
            <div
              key={index}
              className={
                index < choices.length - 1 ? "border-b-1 border-foreground" : ""
              }
            >
              <VotingChoiceSlot
                choiceNumber={index + 1}
                submission={choice}
                onSelect={() => setSelectingFor(index)}
                onClear={() => handleClearChoice(index)}
              />
            </div>
          ))}
        </div>

        <Credenza
          open={selectingFor !== null}
          onOpenChange={(open) => !open && setSelectingFor(null)}
        >
          <CredenzaContent className="max-w-3xl">
            <CredenzaHeader className="border-b border-foreground p-6 sm:px-2 sm:pt-0 sm:pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <CredenzaTitle className="text-xl font-bold">
                    Select{" "}
                    {selectingFor !== null && getOrdinalWord(selectingFor + 1)}{" "}
                    Choice
                  </CredenzaTitle>
                  <p className="mono text-xs tracking-[0.2em] uppercase text-foreground/60 mt-1 font-medium">
                    {`${getAvailableSubmissions().length} Available ${
                      getAvailableSubmissions().length === 1
                        ? "Paper"
                        : "Papers"
                    }`}
                  </p>
                </div>
                <CredenzaClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xs hidden md:flex"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CredenzaClose>
              </div>
            </CredenzaHeader>
            <CredenzaBody className="overflow-y-auto max-h-[60vh] p-0">
              {getAvailableSubmissions().map((submission, index) => (
                <PaperSubmission
                  key={submission.id}
                  submission={submission}
                  isLastItem={index === getAvailableSubmissions().length - 1}
                  onClick={handleSelectSubmission}
                  showDeleteButton={false}
                  className="px-0"
                />
              ))}
            </CredenzaBody>
          </CredenzaContent>
        </Credenza>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Choices Selected
            </p>
            <p className="mono text-2xl font-bold tabular-nums">
              {choices.filter((choice) => choice !== null).length} / {maxRanks}
            </p>
          </div>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="font-mono tracking-wide h-12 px-8 border-1 rounded-none"
          >
            {isSubmitting ? "Submitting Vote..." : "Submit"}
          </Button>
        </div>
        {error && (
          <div className="text-sm text-destructive font-mono text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
