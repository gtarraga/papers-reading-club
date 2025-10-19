"use client";

import PaperSubmission from "@/components/PaperSubmission";
import { VotingChoiceSlot } from "@/components/VotingChoiceSlot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import {
  getCurrentCycle,
  getUserVote,
  submitVote,
  type Submission,
  type User,
} from "@/lib/mock-backend";
import { Check, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface VotingFormProps {
  user: User;
}

export function VotingForm({ user }: VotingFormProps) {
  const [firstChoice, setFirstChoice] = useState<Submission | null>(null);
  const [secondChoice, setSecondChoice] = useState<Submission | null>(null);
  const [thirdChoice, setThirdChoice] = useState<Submission | null>(null);
  const [selectingFor, setSelectingFor] = useState<1 | 2 | 3 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const cycle = getCurrentCycle();
    setSubmissions(cycle.submissions);

    const existingVote = getUserVote(user.id);
    if (existingVote) {
      setHasVoted(true);
      const rankedSubmissions = Object.entries(existingVote.rankings)
        .sort(([, a], [, b]) => a - b)
        .map(([id]) => cycle.submissions.find((s) => s.id === id))
        .filter(Boolean) as Submission[];

      if (rankedSubmissions[0]) setFirstChoice(rankedSubmissions[0]);
      if (rankedSubmissions[1]) setSecondChoice(rankedSubmissions[1]);
      if (rankedSubmissions[2]) setThirdChoice(rankedSubmissions[2]);
    }
  }, [user.id]);

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

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const rankings: Record<string, number> = {};
      if (firstChoice) rankings[firstChoice.id] = 1;
      if (secondChoice) rankings[secondChoice.id] = 2;
      if (thirdChoice) rankings[thirdChoice.id] = 3;

      submitVote(user.id, rankings);
      setHasVoted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = firstChoice !== null;

  if (hasVoted) {
    return (
      <Card className="p-10 border-2 border-foreground bg-primary/5 shadow-none rounded-xs">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Vote Submitted
            </h3>
            <p className="font-serif text-foreground/80 text-base leading-relaxed max-w-md mx-auto font-medium">
              Thank you for voting! Results will be announced when the voting
              period ends.
            </p>
          </div>
          <div className="pt-6 border-t-2 border-foreground">
            <h4 className="mono text-xs tracking-[0.2em] uppercase text-foreground/60 mb-4 font-medium">
              Your Rankings
            </h4>
            <div className="space-y-2 max-w-md mx-auto">
              {[firstChoice, secondChoice, thirdChoice].map((choice, index) => {
                if (!choice) return null;
                return (
                  <div
                    key={choice.id}
                    className="flex items-center gap-4 text-left p-3 bg-background rounded-xs border border-border"
                  >
                    <span className="mono font-bold text-lg w-8 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-serif text-sm font-medium">
                      {choice.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const choices = [
    { number: 1 as const, submission: firstChoice },
    { number: 2 as const, submission: secondChoice },
    { number: 3 as const, submission: thirdChoice },
  ];

  return (
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
                    getAvailableSubmissions().length === 1 ? "Paper" : "Papers"
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
            {[firstChoice, secondChoice, thirdChoice].filter(Boolean).length} /
            3
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
    </form>
  );
}
