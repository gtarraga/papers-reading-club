"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getUserSubmissionCount,
  submitPaper,
  type User,
} from "@/lib/mock-backend";
import { useEffect, useState } from "react";

interface PaperSubmissionFormProps {
  user: User;
  onDataChange: () => void;
}

export function PaperSubmissionForm({
  user,
  onDataChange,
}: PaperSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSubmissionCount, setUserSubmissionCount] = useState(0);

  useEffect(() => {
    setUserSubmissionCount(getUserSubmissionCount(user.id));
  }, [user.id]);

  const canSubmit = userSubmissionCount < 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      submitPaper({
        title,
        url,
        publicationDate: new Date(publicationDate),
        recommendation,
        submittedBy: user.name,
        submittedByUserId: user.id,
      });

      setTitle("");
      setUrl("");
      setPublicationDate("");
      setRecommendation("");

      setUserSubmissionCount(getUserSubmissionCount(user.id));
      onDataChange();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 border-2 shadow-none rounded-xs">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 md:col-span-2">
            <Label
              htmlFor="title"
              className="mono text-xs tracking-[0.2em] uppercase font-medium"
            >
              Paper Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the paper title"
              required
              className="font-mono border-2 h-12 text-base rounded-xs"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="url"
              className="mono text-xs tracking-[0.2em] uppercase font-medium"
            >
              Paper URL
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://arxiv.org/abs/..."
              required
              className="font-mono border-2 h-12 text-base rounded-xs"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="publicationDate"
              className="mono text-xs tracking-[0.2em] uppercase font-medium"
            >
              Publication Date
            </Label>
            <Input
              id="publicationDate"
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              required
              className="font-mono border-2 h-12 text-base rounded-xs"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label
              htmlFor="recommendation"
              className="mono text-xs tracking-[0.2em] uppercase font-medium"
            >
              Why should we read this?
            </Label>
            <textarea
              id="recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Share why this paper is worth reading..."
              required
              rows={5}
              className="w-full rounded-xs border-2 border-input bg-background px-4 py-3 text-base font-serif leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t-2 border-border">
          <div className="space-y-1">
            <p className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
              Submissions Left
            </p>
            <p className="mono text-2xl font-bold tabular-nums">
              {2 - userSubmissionCount} / 2
            </p>
          </div>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="font-mono tracking-wide h-12 px-8 border-2 rounded-xs"
          >
            {isSubmitting ? "Submitting..." : "Submit Paper"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
