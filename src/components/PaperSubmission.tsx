import type { Participant, Submission } from "@/db/types";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface PaperSubmissionProps {
  submission: Submission & { participant?: Participant };
  className?: string;
  isLastItem: boolean;
  onClick?: (submission: Submission) => void;
}

function PaperSubmission({
  submission,
  className,
  isLastItem,
  onClick,
}: PaperSubmissionProps) {
  const content = (
    <div
      className={cn(
        "flex items-start justify-between gap-6 p-6 transition-colors",
        !isLastItem && "border-b border-foreground",
        className
      )}
    >
      <div className="flex-1 space-y-2">
        <div className="flex flex-col space-y-2 md:space-y-1">
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
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs mono tracking-wider text-foreground/60 font-medium">
            {submission.publicationDate && (
              <>
                <span>
                  PUBLISHED{" "}
                  {format(
                    submission.publicationDate,
                    "MMM d, yyyy"
                  ).toUpperCase()}
                </span>
                <span className="hidden md:inline">•</span>
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
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(submission)}
        className={`w-full text-left hover:bg-primary/5 transition-colors ${
          !isLastItem ? "border-b border-foreground" : ""
        }`}
      >
        {content}
      </button>
    );
  }

  return content;
}

export default PaperSubmission;
