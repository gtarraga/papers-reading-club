import type { Participant, Submission } from "@/db/types";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface PaperSubmissionProps {
  submission: Submission & { participant?: Participant };
  className?: string;
  isLastItem: boolean;
  user?: Participant;
  votingPhase?: boolean;
  onVote?: (submissionId: Submission["id"], rank: number) => Promise<void>;
  onDelete?: (id: Submission["id"]) => Promise<void>;
  onClick?: (submission: Submission) => void;
  showDeleteButton?: boolean;
}

function PaperSubmission({
  submission,
  className,
  isLastItem,
  user,
  votingPhase = false,
  onVote,
  onDelete,
  onClick,
  showDeleteButton = true,
}: PaperSubmissionProps) {
  const content = (
    <div className={cn("flex items-start justify-between gap-6", className)}>
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <a
            href={submission.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group hover:underline decoration-primary decoration-3 underline-offset-1"
          >
            <h4 className="inline text-lg font-bold leading-tight">
              {submission.title}
            </h4>
            <ExternalLink className="inline h-3 w-3 ml-2 text-primary stroke-[2.5] align-baseline" />
          </a>
          <div className="flex items-center gap-3 text-xs mono tracking-wider text-foreground/60 font-medium">
            {submission.publicationDate && (
              <>
                <span>
                  PUBLISHED{" "}
                  {format(
                    submission.publicationDate,
                    "MMM d, yyyy"
                  ).toUpperCase()}
                </span>
                <span>•</span>
              </>
            )}
            {submission.participant && (
              <span>
                SUBMITTED BY {submission.participant.firstName.toUpperCase()}
                {submission.participant.lastName &&
                  ` ${submission.participant.lastName.toUpperCase()}`}
              </span>
            )}
          </div>
        </div>
        <p className="font-serif text-sm leading-relaxed text-foreground/90 font-medium">
          {submission.recommendation}
        </p>
      </div>
      {showDeleteButton &&
        user &&
        submission.participantId === user.id &&
        onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(submission.id);
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive/20 rounded-xs"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(submission)}
        className={`w-full p-6 text-left hover:bg-primary/5 transition-colors ${
          !isLastItem ? "border-b border-foreground" : ""
        }`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`p-6 transition-colors ${
        !isLastItem && "border-b border-foreground"
      }`}
    >
      {content}
    </div>
  );
}

export default PaperSubmission;
