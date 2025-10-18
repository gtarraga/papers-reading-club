"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ExternalLink, Trophy } from "lucide-react"
import { format } from "date-fns"

interface PastResult {
  cycleNumber: number
  winner: {
    title: string
    url: string
    submittedBy: string
  }
  votingEndDate: Date
  allSubmissions: {
    title: string
    finalRank: number
  }[]
}

interface ResultsDisplayProps {
  pastResults: PastResult[]
}

export function ResultsDisplay({ pastResults }: ResultsDisplayProps) {
  const [selectedCycle, setSelectedCycle] = useState(pastResults[0]?.cycleNumber)

  const selectedResult = pastResults.find((r) => r.cycleNumber === selectedCycle)

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {pastResults.map((result) => (
          <button
            key={result.cycleNumber}
            onClick={() => setSelectedCycle(result.cycleNumber)}
            className={`px-5 py-3 rounded-md mono text-sm font-bold tracking-wider uppercase transition-all border-2 ${
              selectedCycle === result.cycleNumber
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            Cycle {String(result.cycleNumber).padStart(2, "0")}
          </button>
        ))}
      </div>

      {selectedResult && (
        <div className="space-y-8">
          {/* Winner Card */}
          <Card className="p-8 border-2 border-primary bg-primary/5 shadow-none">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="mono text-xs tracking-[0.2em] uppercase text-primary font-bold">Winner</div>
                  <div className="mono text-xs text-muted-foreground tracking-wider">
                    {format(selectedResult.votingEndDate, "MMM d, yyyy").toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold leading-tight">{selectedResult.winner.title}</h3>
                <p className="mono text-sm text-muted-foreground tracking-wider">
                  SUBMITTED BY {selectedResult.winner.submittedBy.toUpperCase()}
                </p>
              </div>
              <a
                href={selectedResult.winner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm mono tracking-wider text-primary hover:underline uppercase font-medium"
              >
                Read Paper
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>

          {/* All Rankings */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold tracking-tight">Final Rankings</h4>
            <div className="grid gap-3">
              {selectedResult.allSubmissions
                .sort((a, b) => a.finalRank - b.finalRank)
                .map((submission) => (
                  <Card key={submission.title} className="p-5 border-2 shadow-none">
                    <div className="flex items-center gap-5">
                      <div className="flex-shrink-0 w-14 h-14 rounded-md bg-muted border-2 border-border flex items-center justify-center">
                        <span className="text-2xl font-bold mono">{submission.finalRank}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-base leading-tight">{submission.title}</h5>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
