"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container grid min-h-[60dvh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <p className="font-serif text-3xl font-semibold">
          Something went wrong
        </p>
        <p className="mt-3 text-muted-foreground">
          An unexpected error occurred while loading this page. Please try
          again, or return to the homepage.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCw className="size-4" />
            Try again
          </Button>
          <Button href="/" variant="outline">
            Back to homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
