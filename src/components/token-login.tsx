"use client";

import { validateTokenAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CycleStatus, Participant } from "@/db/types";
import { AlertCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface TokenLoginProps {
  groupId: number;
  variant?: "fullpage" | "embedded";
  status?: CycleStatus;
  onLogin: (token: string, participant: Participant) => void;
}

export function TokenLogin({
  groupId,
  variant = "fullpage",
  status,
  onLogin,
}: TokenLoginProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Transform to lowercase and trim for validation
      const processedToken = token.trim().toLowerCase();
      if (!processedToken) {
        setError("Please enter a token");
        setIsLoading(false);
        return;
      }

      // Call server action to validate token and get/create participant
      // Server automatically extracts name from token (e.g., "papers-john-doe" -> "John Doe")
      const result = await validateTokenAction(processedToken, groupId);

      if (result.success && result.participant) {
        onLogin(processedToken, result.participant);
      } else {
        setError(result.error || "Invalid token. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <Card className="w-full max-w-lg p-10 border-1 border-foreground shadow-none rounded-xs mx-auto">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <div className="mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Access Required
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {status === "submission"
              ? "Submission Form"
              : status === "voting"
              ? "Voting Form"
              : "Papers Reading Club"}
          </h1>
          <p className="font-serif text-muted-foreground text-lg leading-relaxed">
            Enter your access token to participate in paper selection cycles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="token"
              className="mono text-xs tracking-[0.2em] uppercase"
            >
              Access Token
            </Label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="PERSONAL-TOKEN-XXXXX"
              className="font-mono uppercase text-base h-12"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xs border border-destructive/80">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className={"w-full font-mono tracking-wide h-12 text-base border-2"}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Access Form"}
          </Button>

          {/* <Button
            type="submit"
            className={cn(
              "w-full font-mono tracking-wide h-12 text-base border-2 border-foreground bg-background text-foreground",
              "hover:bg-background hover:text-foreground",
              "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all"
            )}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Access Form"}
          </Button> */}
        </form>
      </div>
    </Card>
  );

  if (variant === "embedded") {
    return content;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {content}
    </div>
  );
}
