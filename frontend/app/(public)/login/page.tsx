'use client';

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FEATURES = [
  {
    title: "AI Export Copilot",
    desc: "Ask anything about HS codes, duties, and DGFT procedures — instant, sourced answers.",
  },
  {
    title: "48+ Government Schemes",
    desc: "RoDTEP, EPCG, Duty Drawback — auto-matched to your product and export stage.",
  },
  {
    title: "14 Active FTA Calculators",
    desc: "Calculate real duty savings under CEPA, ECTA, ASEAN, and every live India FTA.",
  },
  {
    title: "Smart Compliance Checklists",
    desc: "Country-specific documents — Invoice, BL, COO, FSSAI — generated instantly.",
  },
];

const STATS = [
  { value: "12,400+", label: "Exporters" },
  { value: "48", label: "Gov. Schemes" },
  { value: "100+", label: "Markets" },
];

export default function LoginPage() {
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
        style={{
          display: "none",
          width: "50%",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          background: "#0f0e0c",
          flexDirection: "column",
        }}
        className="md-left-panel"
      >
        {/* India tricolor hairline — aesthetic anchor */}
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

        {/* Warm radial glow from orange */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 40% at 18% 22%, rgba(234,88,12,0.18) 0%, transparent 70%), radial-gradient(ellipse 45% 35% at 85% 78%, rgba(19,136,8,0.07) 0%, transparent 70%)",
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

            {/* Live badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(234,88,12,0.1)",
                border: "1px solid rgba(234,88,12,0.2)",
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
                  background: "#ea580c",
                  display: "inline-block",
                  flexShrink: 0,
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fb923c",
                }}
              >
                Platform v2.0 · Now live
              </span>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontFamily:
                  "var(--font-instrument-serif, 'Instrument Serif', Georgia, serif)",
                fontSize: "clamp(1.9rem, 2.8vw, 2.75rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#f9f8f5",
                marginBottom: "1rem",
              }}
            >
              Ship Indian.
              <br />
              <em style={{ fontStyle: "italic", color: "#fb923c" }}>Win global.</em>
            </h2>

            {/* Sub-copy */}
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "#6b6561",
                maxWidth: "26rem",
                marginBottom: "2rem",
              }}
            >
              The all-in-one export workspace for Indian businesses — from your first IEC to
              scaling across 100+ markets with AI-guided compliance.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(234,88,12,0.14)",
                      border: "1px solid rgba(234,88,12,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3.5L3.2 5.8L8 1"
                        stroke="#ea580c"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
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
                      {f.title}
                    </span>
                    <span style={{ fontSize: "0.73rem", color: "#555150", lineHeight: 1.5 }}>
                      {f.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div
              style={{
                display: "flex",
                borderRadius: "0.875rem",
                overflow: "hidden",
                border: "1px solid rgba(255,153,51,0.12)",
                background: "rgba(255,153,51,0.04)",
              }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    padding: "0.875rem 0.5rem",
                    textAlign: "center",
                    borderRight:
                      i < STATS.length - 1 ? "1px solid rgba(255,153,51,0.1)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#fb923c",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "#524e4a",
                      marginTop: "0.25rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: "0.68rem", color: "#3a3733", marginTop: "1.5rem" }}>
            © 2026 India2World &nbsp;·&nbsp; DGFT & CBIC aligned &nbsp;·&nbsp; Trusted by exporters across India
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
          <div className="md-hide-logo" style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ea580c" />
                <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#1a1714" }}>India2World</span>
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
              Welcome back
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b6762" }}>
              Sign in to your export workspace.
            </p>
          </div>

          {/* Clerk form — no card wrapper, floats directly on white */}
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              layout: { socialButtonsPlacement: "top", logoPlacement: "none" },
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0 bg-transparent border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formFieldLabel:
                  "block text-xs font-semibold text-zinc-700 mb-1",
                formFieldInput:
                  "w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition",
                formFieldInputShowPasswordButton: "text-zinc-400 hover:text-zinc-600",
                formButtonPrimary:
                  "w-full h-11 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 active:scale-[0.98] transition",
                dividerLine: "bg-zinc-100",
                dividerText:
                  "text-[10px] font-semibold uppercase tracking-wider text-zinc-400",
                socialButtonsBlockButton:
                  "h-10 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition",
                socialButtonsBlockButtonText: "text-xs font-semibold text-zinc-700",
                footerActionText: "text-xs text-zinc-400",
                footerActionLink:
                  "text-xs font-semibold text-orange-600 hover:text-orange-700",
                alert:
                  "rounded-xl border border-orange-100 bg-orange-50 text-xs text-orange-700",
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
            By signing in you agree to our{" "}
            <Link href="#" style={{ textDecoration: "underline", color: "#a09c97" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" style={{ textDecoration: "underline", color: "#a09c97" }}>
              Privacy Policy
            </Link>
            .
          </p>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
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
