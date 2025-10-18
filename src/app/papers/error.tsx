"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (could integrate error reporting service)
    console.error("Papers page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
      <Card className="p-8 border-black max-w-md">
        <h2 className="font-mono text-2xl text-stone-900 mb-4">
          Something went wrong
        </h2>
        <p className="font-serif text-stone-600 mb-6">
          We encountered an error while loading the papers page. Please try
          again.
        </p>
        {error.message && (
          <p className="font-mono text-sm text-stone-500 mb-6 p-4 bg-stone-100 rounded">
            {error.message}
          </p>
        )}
        <Button onClick={reset} className="font-mono w-full">
          Try Again
        </Button>
      </Card>
    </div>
  );
}
