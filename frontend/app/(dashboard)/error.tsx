"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {error.message || "An unexpected error occurred in the dashboard."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-white dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
