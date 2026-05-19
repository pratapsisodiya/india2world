"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* dot-grid texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 dark:opacity-30" />

      {/* floating saffron ring */}
      <div className="absolute h-[520px] w-[520px] rounded-full border border-saffron-200/30 animate-spin-slow dark:border-saffron-500/10" />
      <div className="absolute h-[360px] w-[360px] rounded-full border border-india-green-200/30 animate-spin-slow-reverse dark:border-india-green-500/10" />

      <div className="relative z-10 text-center">
        {/* Tricolor bar accent */}
        <div className="mx-auto mb-6 h-1 w-24 tricolor-gradient rounded-full" />

        {/* 404 number */}
        <p className="text-[7rem] font-extrabold leading-none tracking-tight text-saffron-500/20 dark:text-saffron-500/15 select-none">
          404
        </p>

        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 max-w-xs mx-auto text-sm text-foreground/60">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full bg-saffron-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
          >
            Go home
          </Link>
          <Link
            href="/dashboard/chat"
            className="gradient-border inline-flex h-10 items-center justify-center rounded-full border border-saffron-200 bg-background px-6 text-sm font-semibold text-saffron-600 transition-colors hover:bg-saffron-50 dark:border-saffron-500/30 dark:text-saffron-400 dark:hover:bg-saffron-500/10"
          >
            Ask the agent
          </Link>
        </div>

        {/* Tricolor bar accent bottom */}
        <div className="mx-auto mt-8 h-1 w-12 tricolor-gradient rounded-full opacity-50" />
      </div>
    </div>
  );
}
