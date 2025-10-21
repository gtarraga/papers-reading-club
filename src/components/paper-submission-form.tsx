"use client";

import { submitPaper } from "@/actions/submission.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Cycle, Group, Participant, Submission } from "@/db/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Paper title is required")
    .max(200, "Paper title must be at most 200 characters"),
  url: z.string().url("Please enter a valid URL"),
  publicationDate: z.string().optional(),
  recommendation: z
    .string()
    .min(10, "Recommendation must be at least 10 characters")
    .max(500, "Recommendation must be at most 500 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface PaperSubmissionFormProps {
  token: string;
  cycleId: Cycle["id"];
  groupId: Group["id"];
  participant: Participant;
  maxSubmissions?: number;
  currentSubmissionCount: number;
  onOptimisticAdd?: (
    optimisticData: Submission & { participant: Participant }
  ) => void;
  onDataChange?: () => void;
}

export function PaperSubmissionForm({
  token,
  cycleId,
  groupId,
  participant,
  maxSubmissions = 2,
  currentSubmissionCount,
  onOptimisticAdd,
  onDataChange,
}: PaperSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      publicationDate: "",
      recommendation: "",
    },
  });

  const canSubmit = currentSubmissionCount < maxSubmissions;

  const onSubmit = async (data: FormData) => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create optimistic submission
      if (onOptimisticAdd) {
        const optimisticSubmission: Submission & { participant: Participant } =
          {
            id: -Date.now(),
            cycleId,
            participantId: participant.id,
            title: data.title,
            url: data.url,
            publicationDate: data.publicationDate
              ? new Date(data.publicationDate)
              : null,
            recommendation: data.recommendation || null,
            submittedAt: new Date(),
            participant: participant,
          };
        onOptimisticAdd(optimisticSubmission);
      }

      // Convert to FormData for server action
      const formData = new globalThis.FormData();
      formData.append("title", data.title);
      formData.append("url", data.url);
      if (data.publicationDate) {
        formData.append("publicationDate", data.publicationDate);
      }
      formData.append("recommendation", data.recommendation);

      // Call server action
      const result = await submitPaper(token, cycleId, groupId, formData);

      if (result.success) {
        form.reset();
        onDataChange?.();
      } else {
        setError(result.error || "Failed to submit paper");
      }
    } catch (err) {
      console.error("Error submitting paper:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Submit Paper</h2>
        {/* <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
          Submit papers you'd like the group to read. Let us know why this paper
          interests you.
        </p> */}
      </div>
      <Card className="p-8 border-1 shadow-none rounded-xs border-foreground">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FieldGroup className="grid md:grid-cols-2 gap-6">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="title" className="text-xs">
                    Paper Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter the paper title"
                    aria-invalid={fieldState.invalid}
                    className="font-mono h-12 text-base rounded-xs"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="url" className="text-xs">
                    Paper URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id="url"
                    type="url"
                    placeholder="https://arxiv.org/abs/..."
                    aria-invalid={fieldState.invalid}
                    className="font-mono h-12 text-base rounded-xs"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="publicationDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="publicationDate" className="text-xs">
                    Publication Date
                  </FieldLabel>
                  <Input
                    {...field}
                    id="publicationDate"
                    type="date"
                    aria-invalid={fieldState.invalid}
                    className="font-mono h-12 text-base rounded-xs"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="recommendation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="recommendation" className="text-xs">
                    Why should we read this?
                  </FieldLabel>
                  <textarea
                    {...field}
                    id="recommendation"
                    placeholder="Share why this paper is worth reading..."
                    rows={5}
                    aria-invalid={fieldState.invalid}
                    className="w-full rounded-xs border-1 border-foreground/20 focus-visible:border-foreground bg-background px-3 py-3 text-sm font-mono leading-relaxed focus-visible:outline-none resize-none"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex items-center justify-between pt-4 border-t-2 border-border">
            <div className="space-y-1">
              <p className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
                Submissions Left
              </p>
              <p className="mono text-2xl font-bold tabular-nums">
                {maxSubmissions - currentSubmissionCount} / {maxSubmissions}
              </p>
            </div>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="font-mono tracking-wide h-12 px-8 border-1 rounded-none uppercase"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
          {error && (
            <div className="text-sm text-destructive font-mono text-center">
              {error}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
