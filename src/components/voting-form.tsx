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
import type { Cycle, Group, Participant, Submission, Vote } from "@/db/types";
import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface VotingFormProps {
  token: string;
  cycleId: Cycle["id"];
  groupId: Group["id"];
  participant: Participant;
  submissions: Array<Submission & { participant: Participant }>;
  maxRanks: number;
  existingVote?: Vote | null;
}

export function VotingForm({
  token,
  cycleId,
  groupId,
  participant,
  submissions,
  maxRanks,
  existingVote,
}: VotingFormProps) {
  const [firstChoice, setFirstChoice] = useState<Submission | null>(null);
  const [secondChoice, setSecondChoice] = useState<Submission | null>(null);
  const [thirdChoice, setThirdChoice] = useState<Submission | null>(null);
  const [selectingFor, setSelectingFor] = useState<1 | 2 | 3 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(!!existingVote);

  const handleSelectSubmission = (submission: Submission) => {
    if (selectingFor === 1) setFirstChoice(submission);
    else if (selectingFor === 2) setSecondChoice(submission);
    else if (selectingFor === 3) setThirdChoice(submission);
    setSelectingFor(null);
  };

  const handleClearChoice = (choice: 1 | 2 | 3) => {
    if (choice === 1) setFirstChoice(null);
    else if (choice === 2) setSecondChoice(null);
    else if (choice === 3) setThirdChoice(null);
  };

  const getAvailableSubmissions = () => {
    const selected = [
      firstChoice?.id,
      secondChoice?.id,
      thirdChoice?.id,
    ].filter(Boolean);
    return submissions.filter((s) => !selected.includes(s.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const rankings: Array<{ submissionId: Submission["id"]; rank: number }> =
        [];

      if (firstChoice) rankings.push({ submissionId: firstChoice.id, rank: 1 });
      if (secondChoice)
        rankings.push({ submissionId: secondChoice.id, rank: 2 });
      if (thirdChoice) rankings.push({ submissionId: thirdChoice.id, rank: 3 });

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

  const canSubmit = firstChoice !== null;

  if (hasVoted) {
    return (
      <div className="space-y-2 mono text-center uppercase">
        {/* <h3 className="mono text-2xl font-bold tracking-tight">
          Vote Submitted
        </h3> */}
        <div className="space-y-4">
          <h4 className="text-base tracking-[0.2em] uppercase text-foreground/80 font-medium">
            Your Rankings
          </h4>
          <div className="space-y-2">
            {[firstChoice, secondChoice, thirdChoice].map((choice, index) => {
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

  const choices = [
    { number: 1 as const, submission: firstChoice },
    { number: 2 as const, submission: secondChoice },
    { number: 3 as const, submission: thirdChoice },
  ];

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <div className="space-y-2">
        <h3 className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
          Vote on Papers
        </h3>
        <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
          Rank the papers in order of preference. The winner will be determined
          using instant runoff voting, ensuring the most preferred paper by the
          group is selected.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-0 border-1 border-foreground rounded-xs overflow-hidden">
          {choices.map((choice, index) => (
            <div
              key={choice.number}
              className={
                index < choices.length - 1 ? "border-b-1 border-foreground" : ""
              }
            >
              <VotingChoiceSlot
                choiceNumber={choice.number}
                submission={choice.submission}
                onSelect={() => setSelectingFor(choice.number)}
                onClear={() => handleClearChoice(choice.number)}
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
                    {selectingFor === 1
                      ? "First"
                      : selectingFor === 2
                      ? "Second"
                      : "Third"}{" "}
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
                />
              ))}
            </CredenzaBody>
          </CredenzaContent>
        </Credenza>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-foreground">
          <div className="space-y-1">
            <p className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Choices Selected
            </p>
            <p className="mono text-2xl font-bold tabular-nums">
              {[firstChoice, secondChoice, thirdChoice].filter(Boolean).length}{" "}
              / 3
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
