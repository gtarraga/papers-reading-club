"use client";

import { Button } from "@/components/ui/button";
import type { Submission, User } from "@/lib/mock-backend";
import { format } from "date-fns";
import { Link, Trash2 } from "lucide-react";

interface SubmittedPapersListProps {
  submissions: Submission[];
  user: User;
  onDelete: (id: string) => Promise<void>;
}

export function SubmittedPapersList({
  submissions,
  user,
  onDelete,
}: SubmittedPapersListProps) {
  if (submissions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">Submitted Papers</h3>
        <span className="mono text-sm text-foreground/60 font-medium">
          {submissions.length} {submissions.length === 1 ? "paper" : "papers"}
        </span>
      </div>
      <div className="border border-foreground rounded-xs overflow-hidden">
        {submissions.map((submission, index) => (
          <div
            key={submission.id}
            className={`p-6 transition-colors ${
              index !== submissions.length - 1
                ? "border-b border-foreground"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group hover:underline decoration-primary decoration-3 underline-offset-1"
                  >
                    <h4 className="text-lg font-bold leading-tight">
                      {submission.title}
                    </h4>
                    <Link className="h-4 w-4 flex-shrink-0 text-primary stroke-[2.5]" />
                  </a>
                  <div className="flex items-center gap-3 text-xs mono tracking-wider text-foreground/60 font-medium">
                    <span>
                      PUBLISHED{" "}
                      {format(
                        submission.publicationDate,
                        "MMM d, yyyy"
                      ).toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>
                      SUBMITTED BY {submission.submittedBy.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="font-serif text-sm leading-relaxed text-foreground/90 font-medium">
                  {submission.recommendation}
                </p>
              </div>
              {submission.submittedByUserId === user.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(submission.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive/20 rounded-xs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
