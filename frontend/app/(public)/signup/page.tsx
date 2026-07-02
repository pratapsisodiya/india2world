'use client';

import { useRef, useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const UNLOCKS = [
  { emoji: "🤖", title: "AI Export Copilot", desc: "Instant answers on procedures, HS codes, and markets." },
  { emoji: "📋", title: "48+ Scheme Matcher", desc: "Find every incentive your product qualifies for." },
  { emoji: "🌍", title: "100+ Country Profiles", desc: "FTA status, tariffs, and buyer intelligence." },
  { emoji: "📄", title: "Smart Checklists", desc: "Compliance documents for any product and destination." },
  { emoji: "📊", title: "Export Readiness Score", desc: "Know your gaps. Get a personalized action plan." },
];

const TESTIMONIAL = {
  quote:
    "We claimed RoDTEP in week one. India2World mapped our HS code, found our eligibility, and walked us through the filing — in under 10 minutes.",
  author: "Priya Mehta",
  role: "Director, Mehta Textiles · Surat",
  initials: "PM",
};

export default function SignupPage() {
  const leftPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    function handleMove(e: MouseEvent) {
      const rect = panel!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      panel!.style.setProperty("--glow-x", `${x}%`);
      panel!.style.setProperty("--glow-y", `${y}%`);
    }

    panel.addEventListener("mousemove", handleMove);
    return () => panel.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
      }}
    >
      {/* ── Left panel ─────────────────────────────────────── */}
      <div
        ref={leftPanelRef}
        style={{
          display: "none",
          width: "50%",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          background: "#0f0e0c",
          flexDirection: "column",
          "--glow-x": "20%",
          "--glow-y": "20%",
        } as React.CSSProperties}
        className="md-left-panel"
      >
        {/* India tricolor hairline */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background:
              "linear-gradient(to bottom, #FF9933 33.333%, #ffffff 33.333% 66.666%, #138808 66.666%)",
            zIndex: 20,
          }}
        />

        {/* Cursor-following glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(ellipse 40% 35% at var(--glow-x) var(--glow-y), rgba(234,88,12,0.13) 0%, transparent 70%)",
            transition: "background 0.15s ease",
            zIndex: 5,
          }}
        />

        {/* Warm radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 45% at 20% 20%, rgba(234,88,12,0.16) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(19,136,8,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Dot-grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle, rgba(249,248,245,0.04) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Panel content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "2.5rem 3rem",
            overflowY: "auto",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="India2World">
              <rect width="28" height="28" rx="8" fill="#ea580c" />
              <path
                d="M8 20L20 8M20 8H11M20 8V17"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#f9f8f5",
              }}
            >
              India2World
            </span>
          </Link>

          {/* Main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "2rem" }}>

            {/* Free badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(19,136,8,0.1)",
                border: "1px solid rgba(19,136,8,0.2)",
                borderRadius: "9999px",
                padding: "0.2rem 0.75rem",
                width: "fit-content",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4ade80",
                }}
              >
                Free forever · No card needed
              </span>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontFamily:
                  "var(--font-instrument-serif, 'Instrument Serif', Georgia, serif)",
                fontSize: "clamp(1.8rem, 2.6vw, 2.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#f9f8f5",
                marginBottom: "0.875rem",
              }}
            >
              Zero to first
              <br />
              shipment.
              <br />
              <em style={{ fontStyle: "italic", color: "#fb923c" }}>In 20 minutes.</em>
            </h2>

            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "#6b6561",
                maxWidth: "25rem",
                marginBottom: "1.75rem",
              }}
            >
              Your workspace is ready the moment you sign up — no setup, no configuration. Just
              open the tools and start exporting.
            </p>

            {/* What you unlock */}
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#4a4641",
                marginBottom: "0.75rem",
              }}
            >
              What you unlock today
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.75rem" }}>
              {UNLOCKS.map((u) => (
                <div
                  key={u.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    background: "rgba(249,248,245,0.03)",
                    border: "1px solid rgba(249,248,245,0.05)",
                    borderRadius: "0.625rem",
                    padding: "0.6rem 0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1rem", flexShrink: 0, lineHeight: 1.3 }}>{u.emoji}</span>
                  <div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#c8c4c0",
                        display: "block",
                        marginBottom: "0.1rem",
                      }}
                    >
                      {u.title}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#555150", lineHeight: 1.45 }}>
                      {u.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div
              style={{
                background: "rgba(234,88,12,0.06)",
                border: "1px solid rgba(234,88,12,0.14)",
                borderRadius: "0.875rem",
                padding: "1rem 1.125rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                  color: "#9b9591",
                  fontStyle: "italic",
                  marginBottom: "0.75rem",
                }}
              >
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(234,88,12,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#fb923c",
                    flexShrink: 0,
                  }}
                >
                  {TESTIMONIAL.initials}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c8c4c0" }}>
                    {TESTIMONIAL.author}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#524e4a" }}>{TESTIMONIAL.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: "0.68rem", color: "#3a3733", marginTop: "1.5rem", flexShrink: 0 }}>
            © 2026 India2World &nbsp;·&nbsp; DGFT & CBIC aligned &nbsp;·&nbsp; Trusted by 5,000+ Indian exporters
          </div>
        </div>
      </div>

      {/* ── Right panel (pure white) ────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          padding: "3rem 1.5rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "22rem" }}>

          {/* Mobile logo */}
          <div
            className="md-hide-logo"
            style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ea580c" />
                <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#1a1714" }}>
                India2World
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#0f0e0c",
                letterSpacing: "-0.025em",
                marginBottom: "0.375rem",
              }}
            >
              Create your workspace
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b6762" }}>
              Free to start — no credit card required.
            </p>
          </div>

          {/* Clerk form — floats directly on white */}
          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              layout: { socialButtonsPlacement: "top", logoPlacement: "none" },
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0 bg-transparent border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formFieldLabel: "block text-xs font-semibold text-zinc-700 mb-1",
                formFieldInput:
                  "w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition",
                formFieldInputShowPasswordButton: "text-zinc-400 hover:text-zinc-600",
                formButtonPrimary:
                  "w-full h-11 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 active:scale-[0.98] transition",
                dividerLine: "bg-zinc-100",
                dividerText: "text-[10px] font-semibold uppercase tracking-wider text-zinc-400",
                socialButtonsBlockButton:
                  "h-10 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition",
                socialButtonsBlockButtonText: "text-xs font-semibold text-zinc-700",
                footerActionText: "text-xs text-zinc-400",
                footerActionLink: "text-xs font-semibold text-orange-600 hover:text-orange-700",
                formResendCodeLink: "text-xs font-semibold text-orange-600 hover:text-orange-700",
                otpCodeFieldInput:
                  "h-11 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100",
                alert: "rounded-xl border border-orange-100 bg-orange-50 text-xs text-orange-700",
                formFieldErrorText: "mt-1 text-xs text-red-500",
                identityPreviewText: "text-xs text-zinc-600",
                identityPreviewEditButton: "text-orange-600 hover:text-orange-700",
              },
            }}
          />

          <p
            style={{
              marginTop: "1.25rem",
              textAlign: "center",
              fontSize: "0.7rem",
              color: "#a09c97",
            }}
          >
            By signing up you agree to our{" "}
            <Link href="#" style={{ textDecoration: "underline", color: "#a09c97" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" style={{ textDecoration: "underline", color: "#a09c97" }}>
              Privacy Policy
            </Link>
            .
          </p>

          {/* Trust badge */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #f0ede8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "#fff7ed",
                borderRadius: "9999px",
                padding: "0.2rem 0.75rem",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#ea580c",
                  display: "inline-block",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#c2410c",
                }}
              >
                DGFT & CBIC Aligned
              </span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#a09c97", fontStyle: "italic", textAlign: "center" }}>
              &ldquo;From 0 to first shipment in under 20 minutes.&rdquo;
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#a09c97",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-left-panel { display: flex !important; }
          .md-hide-logo { display: none !important; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
