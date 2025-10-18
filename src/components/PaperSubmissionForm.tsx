"use client";

import { submitPaper } from "@/actions/submission.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cycle, Group, Submission } from "@/db/types";
import { cn } from "@/utils/cn";
import { useActionState, useEffect, useRef } from "react";

interface PaperSubmissionFormProps {
  token: string;
  cycleId: Cycle["id"];
  groupId: Group["id"];
  onOptimisticAdd: (optimisticData: Submission) => void;
}

type FormState = {
  success: boolean;
  error?: string;
  submission?: Submission;
};

export function PaperSubmissionForm({
  token,
  cycleId,
  groupId,
  onOptimisticAdd,
}: PaperSubmissionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      // Create optimistic submission with negative ID (temporary)
      const optimistic: Submission = {
        id: -Date.now(), // Negative ID to avoid conflicts
        cycleId,
        participantId: -1, // Temporary participant ID
        title: formData.get("title") as string,
        url: formData.get("url") as string,
        publicationDate: formData.get("publicationDate")
          ? new Date(formData.get("publicationDate") as string)
          : null,
        recommendation: (formData.get("recommendation") as string) || null,
        submittedAt: new Date(),
      };

      onOptimisticAdd(optimistic);

      // Call server action
      const result = await submitPaper(token, cycleId, groupId, formData);

      return result;
    },
    { success: false }
  );

  // Reset form on successful submission
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <Card className={cn("p-6 bg-white border-black")}>
      <h2 className="text-2xl font-mono font-bold mb-6">Submit a Paper</h2>
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-mono">
            Title *
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            disabled={pending}
            className="font-mono"
            placeholder="Paper title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="font-mono">
            URL *
          </Label>
          <Input
            id="url"
            name="url"
            type="url"
            required
            disabled={pending}
            className="font-mono"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicationDate" className="font-mono">
            Publication Date
          </Label>
          <Input
            id="publicationDate"
            name="publicationDate"
            type="date"
            disabled={pending}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommendation" className="font-mono">
            Why should we read this?
          </Label>
          <textarea
            id="recommendation"
            name="recommendation"
            disabled={pending}
            className={cn(
              "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base font-serif",
              "ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm"
            )}
            placeholder="Your recommendation..."
          />
        </div>

        <Button type="submit" disabled={pending} className="w-full font-mono">
          {pending ? "Submitting..." : "Submit Paper"}
        </Button>

        {state.error && (
          <p className="text-sm text-red-600 font-serif" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-green-600 font-serif" role="status">
            Paper submitted successfully!
          </p>
        )}
      </form>
    </Card>
  );
}
