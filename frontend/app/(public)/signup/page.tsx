'use client';

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-[#f7f6f2] font-sans antialiased">
      {/* Left: dark branded panel */}
      <div className="hidden md:flex md:w-[440px] md:shrink-0 lg:w-[480px] bg-[#0f0e0c] flex-col justify-between p-10 relative overflow-hidden">
        {/* Warm ambient glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_20%_30%,oklch(from_#ea580c_l_c_h/0.18),transparent),radial-gradient(ellipse_50%_50%_at_80%_80%,oklch(from_#d97706_l_c_h/0.10),transparent)]" />
        
        {/* Subtle grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(#f9f8f5 1px, transparent 1px), linear-gradient(90deg, #f9f8f5 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        {/* Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="India2World logo">
              <rect width="28" height="28" rx="8" fill="#ea580c" />
              <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-bold tracking-tight text-[#f9f8f5]">India2World</span>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-6">
          <h2
            className="text-[32px] font-normal text-[#f9f8f5] leading-[1.15] tracking-tight"
            style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif" }}
          >
            Global trade,
            <br />
            <em className="italic text-[#fb923c]">simplified for India.</em>
          </h2>
          <p className="text-sm leading-relaxed text-[#847f79] max-w-xs">
            The all-in-one workspace for IEC tracking, custom schemes, duty savings, and automated documentation.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['AK', 'PV', 'MS'].map((abbr) => (
                <div
                  key={abbr}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f0e0c] bg-[#1c1a17] text-[10px] font-bold text-[#a09c97]"
                >
                  {abbr}
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#58544f]">
              Trusted by <strong className="text-[#f9f8f5]">5,000+</strong> exporters
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-[#58544f]">
          © 2026 India2World. All rights reserved.
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] z-10 flex flex-col">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center md:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ea580c" />
                <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-bold tracking-tight text-[#1a1714]">India2World</span>
            </Link>
          </div>

          <div className="mb-7 text-center md:text-left">
            <h1 className="text-2xl font-bold text-[#1a1714]">Create your account</h1>
            <p className="mt-1.5 text-sm text-[#6b6762]">Free to start — no credit card required.</p>
          </div>

          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              layout: { socialButtonsPlacement: "top", logoPlacement: "none" },
              elements: {
                rootBox: "w-full",
                card: "w-full rounded-2xl border border-[#dbd6d0] bg-white p-8 shadow-[0_4px_16px_oklch(0.15_0.01_60/0.08)]",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formFieldLabel: "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#a09c97]",
                formFieldInput:
                  "h-11 w-full rounded-lg border border-[#dbd6d0] bg-[#f9f8f5] px-3.5 text-sm text-[#1a1714] placeholder:text-[#a09c97] transition focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fff7ed]",
                formFieldInputShowPasswordButton: "text-[#a09c97] hover:text-[#6b6762]",
                formButtonPrimary:
                  "h-11 w-full rounded-lg bg-[#0f0e0c] text-sm font-semibold text-white transition hover:bg-[#1c1a17] hover:shadow-md active:scale-[0.98]",
                dividerLine: "bg-[#e2ddd8]",
                dividerText: "text-[10px] font-semibold uppercase tracking-wider text-[#a09c97]",
                socialButtonsBlockButton:
                  "h-10 rounded-lg border border-[#dbd6d0] bg-white text-sm text-[#1a1714] transition hover:bg-[#f9f8f5] hover:border-[#d1ccc6]",
                socialButtonsBlockButtonText: "text-xs font-semibold text-[#1a1714]",
                footerActionText: "text-xs text-[#a09c97]",
                footerActionLink: "text-xs font-semibold text-[#ea580c] hover:text-[#c2410c]",
                identityPreviewText: "text-xs text-[#1a1714]",
                identityPreviewEditButton: "text-[#ea580c] hover:text-[#c2410c]",
                formResendCodeLink: "text-xs font-semibold text-[#ea580c] hover:text-[#c2410c]",
                otpCodeFieldInput:
                  "h-11 rounded-lg border border-[#dbd6d0] bg-[#f9f8f5] text-sm font-medium text-[#1a1714] focus:border-[#ea580c] focus:ring-2 focus:ring-[#fff7ed]",
                alert: "rounded-lg border border-[#ea580c]/10 bg-[#fff7ed] text-xs text-[#c2410c]",
                formFieldErrorText: "mt-1.5 text-xs text-[#c2410c]",
              },
            }}
          />

          <p className="mt-6 text-center text-[11px] text-[#a09c97]">
            By signing up you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-[#1a1714] transition">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-[#1a1714] transition">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-5 flex justify-center md:justify-start">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#a09c97] transition hover:text-[#1a1714]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </div>

          {/* Trust footer */}
          <div className="mt-8 pt-6 border-t border-[#e2ddd8] flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c] animate-pulse" />
              <span className="text-[10px] font-semibold text-[#c2410c] uppercase tracking-wider">DGFT & CBIC Aligned</span>
            </div>
            <p className="text-[11px] text-[#a09c97] italic text-center">
              &ldquo;From 0 to first shipment in under 20 minutes.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}