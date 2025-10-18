"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ExternalLink, Check } from "lucide-react"
import { format } from "date-fns"
import { getCurrentCycle, submitVote, getUserVote, type User, type Submission } from "@/lib/mock-backend"

interface VotingFormProps {
  user: User
}

export function VotingForm({ user }: VotingFormProps) {
  const [rankings, setRankings] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const cycle = getCurrentCycle()
    setSubmissions(cycle.submissions)

    const existingVote = getUserVote(user.id)
    if (existingVote) {
      setHasVoted(true)
      setRankings(existingVote.rankings)
    }
  }, [user.id])

  const handleRankChange = (submissionId: string, rank: string) => {
    const newRankings = { ...rankings }

    if (rank === "") {
      delete newRankings[submissionId]
    } else {
      const rankNum = Number.parseInt(rank)
      Object.keys(newRankings).forEach((id) => {
        if (newRankings[id] === rankNum && id !== submissionId) {
          delete newRankings[id]
        }
      })
      newRankings[submissionId] = rankNum
    }

    setRankings(newRankings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      submitVote(user.id, rankings)
      setHasVoted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const rankedCount = Object.keys(rankings).length
  const canSubmit = rankedCount > 0

  if (hasVoted) {
    return (
      <Card className="p-10 border-2 border-primary bg-primary/5 shadow-none rounded-xs">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Vote Submitted</h3>
            <p className="font-serif text-foreground/80 text-base leading-relaxed max-w-md mx-auto font-medium">
              Thank you for voting! Results will be announced when the voting period ends.
            </p>
          </div>
          <div className="pt-6 border-t-2 border-border">
            <h4 className="mono text-xs tracking-[0.2em] uppercase text-foreground/60 mb-4 font-medium">
              Your Rankings
            </h4>
            <div className="space-y-2 max-w-md mx-auto">
              {Object.entries(rankings)
                .sort(([, a], [, b]) => a - b)
                .map(([submissionId, rank]) => {
                  const submission = submissions.find((s) => s.id === submissionId)
                  return (
                    <div
                      key={submissionId}
                      className="flex items-center gap-4 text-left p-3 bg-background rounded-xs border border-border"
                    >
                      <span className="mono font-bold text-lg w-8 flex-shrink-0">{rank}</span>
                      <span className="font-serif text-sm font-medium">{submission?.title}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-border rounded-xs overflow-hidden bg-card/50 backdrop-blur-sm">
        {submissions.map((submission, index) => (
          <div
            key={submission.id}
            className={`p-6 hover:bg-primary/5 transition-colors ${
              index !== submissions.length - 1 ? "border-b-2 border-border" : ""
            }`}
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-32 space-y-2">
                <Label
                  htmlFor={`rank-${submission.id}`}
                  className="mono text-xs tracking-[0.2em] uppercase block font-medium text-foreground/60"
                >
                  Rank
                </Label>
                <select
                  id={`rank-${submission.id}`}
                  value={rankings[submission.id] || ""}
                  onChange={(e) => handleRankChange(submission.id, e.target.value)}
                  className="w-full rounded-xs border-2 border-input bg-background px-3 py-2 text-base mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">—</option>
                  {Array.from({ length: submissions.length }, (_, i) => i + 1).map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold leading-tight">{submission.title}</h4>
                  <div className="flex items-center gap-3 text-xs mono tracking-wider text-foreground/60 font-medium">
                    <span>BY {submission.submittedBy.toUpperCase()}</span>
                    <span>•</span>
                    <span>{format(submission.publicationDate, "MMM d, yyyy").toUpperCase()}</span>
                  </div>
                </div>
                <p className="font-serif text-sm leading-relaxed text-foreground/90 font-medium">
                  {submission.recommendation}
                </p>
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm mono tracking-wider text-primary hover:underline uppercase font-medium"
                >
                  Read Paper
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-border">
        <div className="space-y-1">
          <p className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">Papers Ranked</p>
          <p className="mono text-2xl font-bold tabular-nums">
            {rankedCount} / {submissions.length}
          </p>
        </div>
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="font-mono tracking-wide h-12 px-8 border-2 rounded-xs"
        >
          {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
        </Button>
      </div>
    </form>
  )
}
