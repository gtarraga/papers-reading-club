"use client";

import { createNewCycle } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Group } from "@/db/types";
import { cn } from "@/utils/cn";
import { useActionState } from "react";

interface AdminPanelProps {
  groupId: Group["id"];
}

type FormState = {
  success: boolean;
  error?: string;
};

export function AdminPanel({ groupId }: AdminPanelProps) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      const password = formData.get("password") as string;
      const submissionStart = new Date(
        formData.get("submissionStart") as string
      );
      const submissionEnd = new Date(formData.get("submissionEnd") as string);
      const votingEnd = new Date(formData.get("votingEnd") as string);

      const result = await createNewCycle(
        password,
        groupId,
        submissionStart,
        submissionEnd,
        votingEnd
      );

      return {
        success: result.success,
        error: result.error,
      };
    },
    { success: false }
  );

  return (
    <div className="space-y-8">
      {/* Create New Cycle */}
      <Card className={cn("p-6 bg-white border-blue-500 border-2")}>
        <h2 className="text-2xl font-mono font-bold mb-2 text-blue-600">
          Admin Panel
        </h2>
        <p className="text-sm font-serif text-stone-600 mb-6">
          Create a new reading cycle
        </p>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono">
              Admin Password *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={pending}
              className="font-mono"
              placeholder="Enter admin password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionStart" className="font-mono">
              Submission Start *
            </Label>
            <Input
              id="submissionStart"
              name="submissionStart"
              type="datetime-local"
              required
              disabled={pending}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionEnd" className="font-mono">
              Submission End *
            </Label>
            <Input
              id="submissionEnd"
              name="submissionEnd"
              type="datetime-local"
              required
              disabled={pending}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="votingEnd" className="font-mono">
              Voting End *
            </Label>
            <Input
              id="votingEnd"
              name="votingEnd"
              type="datetime-local"
              required
              disabled={pending}
              className="font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full font-mono bg-blue-600 hover:bg-blue-700"
          >
            {pending ? "Creating Cycle..." : "Create New Cycle"}
          </Button>

          {state.error && (
            <p className="text-sm text-red-600 font-serif" role="alert">
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="text-sm text-green-600 font-serif" role="status">
              Cycle created successfully!
            </p>
          )}
        </form>
      </Card>

      {/* Placeholder: Token Patterns */}
      <Card className={cn("p-6 bg-stone-100 border-stone-300")}>
        <h3 className="text-lg font-mono font-semibold mb-2">Token Patterns</h3>
        <p className="text-sm font-serif text-stone-600">
          Manage access token patterns. Coming soon...
        </p>
      </Card>

      {/* Placeholder: Group Settings */}
      <Card className={cn("p-6 bg-stone-100 border-stone-300")}>
        <h3 className="text-lg font-mono font-semibold mb-2">Group Settings</h3>
        <p className="text-sm font-serif text-stone-600">
          Configure group preferences and cadence. Coming soon...
        </p>
      </Card>

      {/* Placeholder: Results Management */}
      <Card className={cn("p-6 bg-stone-100 border-stone-300")}>
        <h3 className="text-lg font-mono font-semibold mb-2">
          Results Management
        </h3>
        <p className="text-sm font-serif text-stone-600">
          Manually calculate and manage cycle results. Coming soon...
        </p>
      </Card>
    </div>
  );
}
