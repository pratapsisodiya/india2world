"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-zinc-200 dark:text-zinc-800">500</p>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred. Please try again or go back to the homepage.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
