"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Globe2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans selection:bg-orange-100 selection:text-orange-900 antialiased">
      {/* ── Left Panel: High-End Editorial Dark ────────────────────────── */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-black p-12 lg:flex lg:w-[42%] xl:p-16 border-r border-zinc-900">
        {/* Subtle, rich background textures */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(249,115,22,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(249,115,22,0.03),transparent_35%)]" />
        
        {/* Minimalist Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="flex w-fit items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <Globe2 className="h-5 w-5 text-orange-500 stroke-[1.75]" />
            <span className="text-lg font-semibold tracking-tight text-white">
              India2World
            </span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto max-w-sm">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1">
            <span className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-400">
              Global Trade Platform
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-medium tracking-tight text-white">
            Welcome back.
          </h1>

          <p className="mb-10 text-sm leading-relaxed text-zinc-400 font-normal">
            Access your saved schemes, FTA calculations, and compliance
            workflows in one secure workspace.
          </p>

          {/* Premium List Items */}
          <div className="space-y-2.5">
            {[
              "Instant AI export guidance",
              "Verified ITC-HS code lookups",
              "Personalised document checklists",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500 stroke-[2]" />
                <span className="text-xs font-medium text-zinc-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10">
          <p className="text-xs tracking-tight text-zinc-600">
            © {new Date().getFullYear()} India2World. Built for global compliance.
          </p>
        </div>
      </div>

      {/* ── Right Panel: Flat & Clean Auth Form ────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-zinc-50 p-6 sm:p-12">
        
        {/* Navigation Elements Header Area */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 sm:px-12 lg:justify-end">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-zinc-900">
              <Globe2 className="h-5 w-5 text-orange-500" />
              <span className="text-base font-semibold tracking-tight">
                India2World
              </span>
            </Link>
          </div>

          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>
        </div>

        {/* Clerk SignIn Container */}
        <div className="w-full max-w-[400px] mt-8 lg:mt-0">
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                logoPlacement: "none",
              },
              elements: {
                rootBox: "w-full",
                card: "w-full rounded-2xl bg-white p-6 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8",

                headerTitle: "text-xl font-semibold tracking-tight text-zinc-900",
                headerSubtitle: "mt-1.5 text-xs font-normal text-zinc-500 leading-normal",

                formFieldLabel: "mb-1 text-xs font-semibold text-zinc-700 tracking-tight",
                formFieldInput:
                  "h-11 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-sm font-normal text-zinc-900 shadow-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5",
                formFieldInputShowPasswordButton:
                  "text-zinc-400 hover:text-zinc-600 transition-colors",

                formButtonPrimary:
                  "mt-3 h-11 rounded-lg bg-orange-500 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 active:transform active:scale-[0.99]",

                dividerLine: "bg-zinc-100",
                dividerText:
                  "text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400",

                socialButtonsBlockButton:
                  "h-11 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 transition-all hover:bg-zinc-50/80",
                socialButtonsBlockButtonText: "text-xs font-medium text-zinc-600",

                footerActionText: "text-xs font-normal text-zinc-500",
                footerActionLink:
                  "text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors",
                identityPreviewEditButton:
                  "text-orange-600 hover:text-orange-700",
                identityPreviewText: "text-xs font-medium text-zinc-700",

                alert: "rounded-xl border border-red-100 bg-red-50/50 text-xs text-red-800",
                formFieldErrorText: "mt-1 text-xs font-normal text-red-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}