import type { Submission, User } from "@/lib/mock-backend";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface PaperSubmissionProps {
  submission: Submission;
  isLastItem: boolean;
  user: User;
  votingPhase?: boolean;
  onVote?: (submissionId: string, rank: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function PaperSubmission({
  submission,
  isLastItem,
  user,
  votingPhase = false,
  onVote,
  onDelete,
}: PaperSubmissionProps) {
  return (
    <div
      key={submission.id}
      className={`p-6 transition-colors ${
        !isLastItem && "border-b border-foreground"
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:underline decoration-primary decoration-3 underline-offset-1"
            >
              <h4 className="inline text-lg font-bold leading-tight">
                {submission.title}
              </h4>
              <ExternalLink className="inline h-3 w-3 ml-2 text-primary stroke-[2.5] align-baseline" />
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
              <span>SUBMITTED BY {submission.submittedBy.toUpperCase()}</span>
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
  );
}

export default PaperSubmission;
