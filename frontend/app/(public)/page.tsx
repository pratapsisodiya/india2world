'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Menu,
  X as XIcon,
  LayoutDashboard,
  PlayCircle,
  ShieldCheck,
  Zap,
  Clock,
  MessageSquare,
  Bot,
  Wand2,
  Hash,
  Globe2,
  Target,
  FileText,
  TrendingUp,
  ChevronDown,
} from 'lucide-react'

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)

  /* ─── Scroll nav ────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ─── Animated counters ─────────────────────────────── */
  useEffect(() => {
    const counters = document.querySelectorAll('[data-counter]')
    const animate = (el: Element, target: number) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        el.textContent = String(target)
        return
      }
      let start: number | null = null
      const duration = 1400
      const step = (ts: number) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = String(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-counter') || '0')
            animate(entry.target, target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    counters.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? -1 : index))
  }, [])

  const closeMobileNav = useCallback(() => setMobileOpen(false), [])

  /* ─── Icon Mapper (Lucide Pack) ─────────────────────── */
  const Icon = ({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) => {
    const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
      'arrow-right': ArrowRight,
      'menu': Menu,
      'x': XIcon,
      'layout-dashboard': LayoutDashboard,
      'play-circle': PlayCircle,
      'shield-check': ShieldCheck,
      'zap': Zap,
      'clock': Clock,
      'message-square': MessageSquare,
      'bot': Bot,
      'wand-2': Wand2,
      'hash': Hash,
      'globe-2': Globe2,
      'target': Target,
      'file-text': FileText,
      'trending-up': TrendingUp,
      'chevron-down': ChevronDown,
    }

    const IconComponent = icons[name]
    if (!IconComponent) return null
    return <IconComponent size={size} className={className} />
  }

  /* ─── Framer Motion Animations ──────────────────────── */
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  }

  const scrollRevealVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  }

  const childRevealVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }

  const routePathVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: 3,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay: 1,
      },
    },
  }

  return (
    <>
      {/* ─── NAV ───────────────────────────────────────────── */}
      <div className="nav-wrap">
        <nav className={`nav ${navScrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
          <Link href="/" className="nav-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="India2World logo">
              <rect width="28" height="28" rx="8" fill="#ea580c" />
              <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>India2World</span>
          </Link>
          <div className="nav-links" role="list">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#sectors">Sectors</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Open App <Icon name="arrow-right" size={13} />
            </Link>
          </div>
          <button
            className="nav-mobile-toggle"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
          </button>
        </nav>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile menu">
        <a href="#features" onClick={closeMobileNav}>
          Features
        </a>
        <a href="#workflow" onClick={closeMobileNav}>
          Workflow
        </a>
        <a href="#sectors" onClick={closeMobileNav}>
          Sectors
        </a>
        <a href="#faq" onClick={closeMobileNav}>
          FAQ
        </a>
        <div className="mobile-nav-divider" />
        <Link href="/login" className="btn-ghost" style={{ textAlign: 'center' }} onClick={closeMobileNav}>
          Log in
        </Link>
        <Link href="/dashboard" className="btn-primary" style={{ justifyContent: 'center' }} onClick={closeMobileNav}>
          Open App →
        </Link>
      </div>

      {/* ─── MAIN ──────────────────────────────────────────── */}
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-inner">
            <motion.div 
              custom={0} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants} 
              className="badge"
            >
              <span className="badge-dot" />
              Platform v2.0 is live
            </motion.div>

            <motion.h1 
              custom={1} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants}
            >
              Global trade,
              <br />
              <em>simplified for India.</em>
            </motion.h1>

            <motion.p 
              custom={2} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants} 
              className="hero-sub"
            >
              The all-in-one workspace for IEC tracking, custom schemes, duty savings, and automated documentation.
            </motion.p>

            <motion.div 
              custom={3} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants} 
              className="hero-ctas"
            >
              <Link href="/signup" className="btn-hero-dark">
                Start Building Free
              </Link>
              <a href="#workflow" className="btn-hero-ghost">
                <Icon name="play-circle" size={15} />
                See how it works
              </a>
            </motion.div>

            <motion.div 
              custom={4} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants} 
              className="hero-trust"
            >
              <span className="trust-item">
                <Icon name="shield-check" size={14} />
                DGFT &amp; CBIC aligned
              </span>
              <span className="trust-item">
                <Icon name="zap" size={14} />
                Instant AI answers
              </span>
              <span className="trust-item">
                <Icon name="clock" size={14} />
                Updated weekly
              </span>
            </motion.div>

            {/* Live stats strip — animated counters */}
            <motion.div
              custom={4.5}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              style={{
                display: 'flex',
                gap: '0',
                marginTop: '1.5rem',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid rgba(255,153,51,0.2)',
                background: 'rgba(255,153,51,0.04)',
              }}
            >
              {[
                { value: 12400, suffix: '+', label: 'Indian Exporters', emoji: '🏭' },
                { value: 48, suffix: '', label: 'Gov. Schemes Mapped', emoji: '📋' },
                { value: 14, suffix: '', label: 'FTAs Covered', emoji: '🤝' },
                { value: 100, suffix: '+', label: 'Country Profiles', emoji: '🌍' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.875rem 0.5rem',
                    borderRight: i < 3 ? '1px solid rgba(255,153,51,0.15)' : 'none',
                    gap: '0.125rem',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{stat.emoji}</span>
                  <span
                    data-counter={stat.value}
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--color-primary)',
                      lineHeight: 1.1,
                    }}
                  >
                    0
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    fontWeight: 500,
                  }}>
                    {stat.label}{stat.suffix}
                  </span>
                </div>
              ))}
            </motion.div>


            {/* Product Preview */}
            <motion.div 
              custom={5} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUpVariants} 
              className="preview-wrap"
            >
              <motion.div 
                className="preview-frame"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              >
                <div className="preview-browser-bar">
                  <div className="browser-dots">
                    <div className="browser-dot" />
                    <div className="browser-dot" />
                    <div className="browser-dot" />
                  </div>
                  <div className="browser-url">
                    <Icon name="layout-dashboard" size={10} />
                    app.india2world.in
                  </div>
                </div>
                <div className="preview-body">
                  <div className="preview-globe">
                    <svg className="globe-svg" viewBox="0 0 480 480" aria-label="Globe showing India-to-world trade routes">
                      <defs>
                        <radialGradient id="globeGrad" cx="30%" cy="28%" r="72%">
                          <stop offset="0%" stopColor="#fff8f4" />
                          <stop offset="100%" stopColor="#fef3ec" />
                        </radialGradient>
                        <clipPath id="discClip">
                          <circle cx="240" cy="240" r="162" />
                        </clipPath>
                        <filter id="glow">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <circle cx="240" cy="240" r="162" fill="url(#globeGrad)" stroke="#e8ddd5" strokeWidth="1.5" />
                      <g clipPath="url(#discClip)" opacity="0.5">
                        <ellipse cx="240" cy="240" rx="162" ry="42" fill="none" stroke="#f0e6df" strokeWidth="1" />
                        <ellipse cx="240" cy="240" rx="162" ry="92" fill="none" stroke="#f0e6df" strokeWidth="1" />
                        <line x1="78" y1="240" x2="402" y2="240" stroke="#f0e6df" strokeWidth="1" />
                        <ellipse cx="240" cy="240" rx="42" ry="162" fill="none" stroke="#f0e6df" strokeWidth="1" />
                        <ellipse cx="240" cy="240" rx="92" ry="162" fill="none" stroke="#f0e6df" strokeWidth="1" />
                        <line x1="240" y1="78" x2="240" y2="402" stroke="#f0e6df" strokeWidth="1" />
                        <circle cx="165" cy="200" r="4" fill="#fdba74" opacity="0.6" />
                        <circle cx="178" cy="218" r="3" fill="#fdba74" opacity="0.5" />
                        <circle cx="155" cy="230" r="2.5" fill="#fdba74" opacity="0.4" />
                        <circle cx="310" cy="180" r="5" fill="#fdba74" opacity="0.65" />
                        <circle cx="330" cy="195" r="3.5" fill="#fdba74" opacity="0.55" />
                        <circle cx="342" cy="175" r="4" fill="#fdba74" opacity="0.5" />
                        <circle cx="280" cy="310" r="3" fill="#fdba74" opacity="0.5" />
                        <circle cx="260" cy="325" r="2.5" fill="#fdba74" opacity="0.4" />
                        <circle cx="295" cy="328" r="3.5" fill="#fdba74" opacity="0.45" />
                        <circle cx="205" cy="270" r="3" fill="#fdba74" opacity="0.45" />
                        <circle cx="190" cy="285" r="2" fill="#fdba74" opacity="0.35" />
                        <circle cx="145" cy="250" r="2" fill="#fdba74" opacity="0.35" />
                        <circle cx="370" cy="230" r="3" fill="#fdba74" opacity="0.45" />
                        <circle cx="358" cy="248" r="2.5" fill="#fdba74" opacity="0.4" />
                        <circle cx="115" cy="210" r="2.5" fill="#fdba74" opacity="0.35" />
                        <circle cx="390" cy="260" r="2" fill="#fdba74" opacity="0.3" />
                        <circle cx="322" cy="360" r="2.5" fill="#fdba74" opacity="0.35" />
                        <circle cx="248" cy="120" r="3" fill="#fdba74" opacity="0.4" />
                        <circle cx="218" cy="135" r="2.5" fill="#fdba74" opacity="0.38" />
                        <circle cx="270" cy="108" r="2" fill="#fdba74" opacity="0.35" />
                      </g>
                      
                      {/* Animated Trade Routes */}
                      <motion.path 
                        d="M252 262 Q210 160 140 152" 
                        fill="none" 
                        stroke="#ea580c" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                        opacity="0.8" 
                        initial="hidden"
                        animate="visible"
                        variants={routePathVariants}
                      />
                      <motion.path 
                        d="M252 262 Q290 180 368 170" 
                        fill="none" 
                        stroke="#ea580c" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                        opacity="0.9" 
                        initial="hidden"
                        animate="visible"
                        variants={routePathVariants}
                      />
                      <motion.path 
                        d="M252 262 Q295 335 335 375" 
                        fill="none" 
                        stroke="#ea580c" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                        opacity="0.55" 
                        initial="hidden"
                        animate="visible"
                        variants={routePathVariants}
                      />
                      <motion.path 
                        d="M252 262 Q190 310 122 305" 
                        fill="none" 
                        stroke="#ea580c" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                        opacity="0.6" 
                        initial="hidden"
                        animate="visible"
                        variants={routePathVariants}
                      />
                      <motion.path 
                        d="M252 262 Q270 180 252 98" 
                        fill="none" 
                        stroke="#ea580c" 
                        strokeWidth="1.4" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                        opacity="0.45" 
                        initial="hidden"
                        animate="visible"
                        variants={routePathVariants}
                      />
                      <circle cx="140" cy="152" r="4" fill="#ea580c" opacity="0.5" />
                      <circle cx="368" cy="170" r="5" fill="#ea580c" opacity="1" filter="url(#glow)" />
                      <circle cx="335" cy="375" r="4" fill="#ea580c" opacity="0.55" />
                      <circle cx="122" cy="305" r="5" fill="#ea580c" opacity="1" filter="url(#glow)" />
                      <circle cx="252" cy="98" r="3.5" fill="#ea580c" opacity="0.45" />
                      <circle cx="252" cy="262" r="6" fill="#ea580c">
                        <animate attributeName="r" values="6;10;6" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="252" cy="262" r="5" fill="#c2410c" />
                      <circle cx="252" cy="262" r="2.5" fill="#fff" />
                    </svg>
                  </div>
                  <div className="preview-sidebar">
                    <div>
                      <div className="sidebar-label">Platform Metrics</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">📋</div>
                      <div>
                        <div className="metric-label">Mapped Schemes</div>
                        <div className="metric-value">
                          <span data-counter="200">0</span>+
                        </div>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">🌏</div>
                      <div>
                        <div className="metric-label">Countries Tracked</div>
                        <div className="metric-value">
                          <span data-counter="160">0</span>+
                        </div>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">📚</div>
                      <div>
                        <div className="metric-label">HS Clusters</div>
                        <div className="metric-value">
                          <span data-counter="60">0</span>+
                        </div>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">⚙️</div>
                      <div>
                        <div className="metric-label">Export Sectors</div>
                        <div className="metric-value">
                          <span data-counter="8">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={scrollRevealVariants}
            >
              <span className="section-eyebrow">Features</span>
              <h2 className="section-heading">A complete toolkit.</h2>
              <p className="section-subtext">Everything to analyze, comply, and ship — packaged into modular, lightning-fast tools.</p>
            </motion.div>

            <div className="bento-grid">
              <motion.a 
                href="/dashboard/chat" 
                className="bento-card bento-wide bento-tall" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="bento-icon">
                    <Icon name="message-square" size={18} />
                  </div>
                  <div className="bento-badge">Most used</div>
                </div>
                <div>
                  <div className="bento-title">
                    AI Copilot <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Ask about procedures, HS codes, and schemes in plain language. Get instant, sourced answers 24/7.</p>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-offset)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-divider)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="bot" size={12} className="text-white" />
                      </div>
                      <div
                        style={{
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-divider)',
                          borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
                          padding: 'var(--space-3)',
                          lineHeight: 1.5,
                        }}
                      >
                        RoDTEP rates for textile exports to UAE range from 0.8% – 3.2% depending on HS classification...
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          background: 'var(--color-primary)',
                          borderRadius: 'var(--radius-md) 0 var(--radius-md) var(--radius-md)',
                          padding: 'var(--space-3)',
                          lineHeight: 1.5,
                          color: '#fff',
                          maxWidth: '70%',
                        }}
                      >
                        What HS code for cotton knit fabric?
                      </div>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--color-surface-offset)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        U
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>

              <motion.a 
                href="/dashboard/schemes" 
                className="bento-card bento-wide" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div className="bento-icon">
                  <Icon name="wand-2" size={18} />
                </div>
                <div>
                  <div className="bento-title">
                    Scheme Engine <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Auto-match to RoDTEP, EPCG, and sector support schemes for your product.</p>
                </div>
              </motion.a>

              <motion.a 
                href="/dashboard/hs-codes" 
                className="bento-card" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div className="bento-icon">
                  <Icon name="hash" size={18} />
                </div>
                <div>
                  <div className="bento-title">
                    HS Lookup <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Search product classes instantly.</p>
                </div>
              </motion.a>

              <motion.a 
                href="/dashboard/fta" 
                className="bento-card" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div className="bento-icon">
                  <Icon name="globe-2" size={18} />
                </div>
                <div className="bento-badge">Beta</div>
                <div>
                  <div className="bento-title">
                    FTA Calculator <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Calculate CEPA duty savings.</p>
                </div>
              </motion.a>

              <motion.a 
                href="/dashboard/readiness" 
                className="bento-card bento-wide" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div className="bento-icon">
                  <Icon name="target" size={18} />
                </div>
                <div>
                  <div className="bento-title">
                    Readiness Pulse <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Surface operational gaps before shipping. A 6-minute gap analysis that prevents costly errors.</p>
                </div>
              </motion.a>

              <motion.a 
                href="/dashboard/checklist" 
                className="bento-card bento-wide" 
                style={{ textDecoration: 'none' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={scrollRevealVariants}
                whileHover={{ y: -6, scale: 1.006, transition: { duration: 0.2 } }}
              >
                <div className="bento-icon">
                  <Icon name="file-text" size={18} />
                </div>
                <div>
                  <div className="bento-title">
                    Smart Checklists <Icon name="arrow-right" size={14} />
                  </div>
                  <p className="bento-desc">Generate compliance documents automatically. Tailored to your product, route, and sector.</p>
                </div>
              </motion.a>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="section section--white">
          <div className="container">
            <div className="workflow-grid">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={scrollRevealVariants}
              >
                <span className="section-eyebrow">The Pipeline</span>
                <h2 className="section-heading">
                  Raw intent to
                  <br />
                  <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>ready shipment.</em>
                </h2>
                <p className="section-subtext">Our guided workflow ensures zero compliance blind spots. Complete all checks in under 20 minutes.</p>
                <div className="social-proof">
                  <div className="avatars">
                    <div className="avatar">AK</div>
                    <div className="avatar">PV</div>
                    <div className="avatar">MS</div>
                  </div>
                  <p className="social-proof-text">
                    Trusted by <strong>5,000+</strong> exporters
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="workflow-steps"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={staggerContainer}
              >
                {[
                  { icon: 'target', title: 'Assess', desc: 'Run a 6-min gap analysis.' },
                  { icon: 'wand-2', title: 'Incentivize', desc: 'Shortlist matched schemes.' },
                  { icon: 'hash', title: 'Classify', desc: 'Confirm ITC-HS product codes.' },
                  { icon: 'globe-2', title: 'Calculate', desc: 'Estimate FTA duty savings.' },
                  { icon: 'file-text', title: 'Document', desc: 'Generate tailored checklists.' },
                  { icon: 'trending-up', title: 'Dispatch', desc: 'Ship with confidence.' },
                ].map((step, i) => (
                  <motion.div 
                    className="step-card" 
                    variants={childRevealVariants} 
                    whileHover={{ y: -4, scale: 1.01 }}
                    key={i}
                  >
                    <div className="step-top">
                      <div className="step-icon-wrap">
                        <Icon name={step.icon} size={14} />
                      </div>
                      <span className="step-num">0{i + 1}</span>
                    </div>
                    <div>
                      <div className="step-title">{step.title}</div>
                      <div className="step-desc">{step.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section id="sectors" className="section">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={scrollRevealVariants}
              style={{ textAlign: 'center' }}
            >
              <span className="section-eyebrow">Sectors</span>
              <h2 className="section-heading">Built for your industry.</h2>
              <p className="section-subtext" style={{ marginInline: 'auto' }}>
                Compliance logic pre-mapped to the specific schemes and councils that matter for your goods.
              </p>
            </motion.div>

            <motion.div 
              className="sectors-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {[
                { name: 'Textiles', hook: 'RoSCTL tracking', q: 'Textiles' },
                { name: 'Agriculture', hook: 'APEDA rules', q: 'Agriculture' },
                { name: 'Pharma', hook: 'CDSCO NOC', q: 'Pharma' },
                { name: 'Gems', hook: 'GJEPC logs', q: 'Gems' },
                { name: 'Engineering', hook: 'EPCG, BIS', q: 'Engineering' },
                { name: 'Tea & Coffee', hook: 'GI tags', q: 'Tea' },
                { name: 'Leather', hook: 'CLE tracking', q: 'Leather' },
                { name: 'Software', hook: 'SEZ routing', q: 'Software' },
              ].map((sector, i) => (
                <motion.a 
                  href={`/dashboard/chat?q=${sector.q}`} 
                  className="sector-pill" 
                  style={{ textDecoration: 'none' }} 
                  variants={childRevealVariants}
                  whileHover={{ y: -3, scale: 1.02 }}
                  key={i}
                >
                  <div className="sector-dot" />
                  <div>
                    <div className="sector-name">{sector.name}</div>
                    <div className="sector-hook">{sector.hook}</div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section section--white">
          <div className="container--narrow">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={scrollRevealVariants}
              style={{ textAlign: 'center' }}
            >
              <span className="section-eyebrow">FAQ</span>
              <h2 className="section-heading">Frequently asked.</h2>
            </motion.div>

            <motion.div 
              className="faq-list"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={scrollRevealVariants}
            >
              {[
                {
                  q: 'Is India2World free to use?',
                  a: 'Yes. Core tools including AI Chat, HS Code Lookup, Scheme Finder, and Document Checklist are completely free.',
                },
                {
                  q: 'Do I need an IEC number?',
                  a: 'No. You can explore the workspace without an IEC, then use the guidance to prepare for actual shipments.',
                },
                {
                  q: 'How accurate is the AI guidance?',
                  a: 'The guidance stays aligned with official export sources, but final filings should always be verified by a licensed broker.',
                },
                {
                  q: 'Which sectors are supported?',
                  a: 'Eight major sectors — textiles, agriculture, pharmaceuticals, gems, engineering goods, tea & coffee, leather, and software.',
                },
              ].map((faq, i) => (
                <div className="faq-item" key={i}>
                  <button className="faq-trigger" onClick={() => toggleFaq(i)}>
                    <span className="faq-q">{faq.q}</span>
                    <motion.span 
                      className="faq-chevron"
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <Icon name="chevron-down" size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section 
          className="cta-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollRevealVariants}
        >
          <div>
            <div className="cta-logo">
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                style={{ margin: '0 auto', borderRadius: 16, boxShadow: '0 4px 16px oklch(from #ea580c l c h / 0.3)' }}
                aria-label="India2World"
              >
                <rect width="56" height="56" rx="16" fill="#ea580c" />
                <path d="M16 40L40 16M40 16H22M40 16V34" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="cta-heading">Ready to deploy?</h2>
            <p className="cta-sub">Zero setup required. Try the AI copilot or run a readiness assessment instantly.</p>
            <div className="cta-buttons">
              <Link href="/signup" className="btn-hero-dark">
                Create Workspace
              </Link>
              <Link href="/dashboard/chat" className="btn-hero-ghost">
                <Icon name="message-square" size={15} />
                Try AI Copilot
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="#ea580c" />
              <path d="M8 20L20 8M20 8H11M20 8V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            India2World
            <span className="footer-year">© 2026</span>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>

      {/* ─── GLOBAL CSS (Light only) ───────────────────────── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-bg:             #f7f6f2;
              --color-surface:        #f9f8f5;
              --color-surface-2:      #ffffff;
              --color-surface-offset: #f0ede8;
              --color-divider:        #e2ddd8;
              --color-border:         #dbd6d0;
              --color-text:           #1a1714;
              --color-text-muted:     #6b6762;
              --color-text-faint:     #a09c97;
              --color-text-inverse:   #f9f8f5;
              --color-primary:        #ea580c;
              --color-primary-hover:  #c2410c;
              --color-primary-light:  #fff7ed;
              --color-primary-mid:    #fdba74;
              --color-amber:          #d97706;
              --color-dark:           #0f0e0c;
              --color-dark-hover:     #1c1a17;
              --shadow-sm:  0 1px 3px oklch(0.15 0.01 60 / 0.08);
              --shadow-md:  0 4px 16px oklch(0.15 0.01 60 / 0.10);
              --shadow-lg:  0 12px 40px oklch(0.15 0.01 60 / 0.14);
              --shadow-xl:  0 24px 64px oklch(0.15 0.01 60 / 0.16);
              --radius-sm: 0.375rem;
              --radius-md: 0.5rem;
              --radius-lg: 0.75rem;
              --radius-xl: 1.25rem;
              --radius-2xl: 1.75rem;
              --radius-full: 9999px;
              --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
              --space-4: 1rem; --space-5: 1.25rem; --space-6: 1.5rem;
              --space-8: 2rem; --space-10: 2.5rem; --space-12: 3rem;
              --space-16: 4rem; --space-20: 5rem; --space-24: 6rem;
              --text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
              --text-sm:   clamp(0.875rem, 0.82rem + 0.28vw, 1rem);
              --text-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);
              --text-lg:   clamp(1.125rem, 1rem    + 0.6vw,  1.375rem);
              --text-xl:   clamp(1.375rem, 1.1rem  + 1.4vw,  2rem);
              --text-2xl:  clamp(2rem,     1.3rem  + 2.8vw,  3.25rem);
              --text-hero: clamp(2.8rem,   1.5rem  + 5.5vw,  5.5rem);
              --font-display: var(--font-instrument-serif), 'Instrument Serif', Georgia, serif;
              --font-body:    var(--font-inter), 'Inter', system-ui, sans-serif;
              --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
            }

            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html { scroll-behavior: smooth; scroll-padding-top: 5rem; -webkit-font-smoothing: antialiased; }
            body {
              font-family: var(--font-body);
              font-size: var(--text-base);
              color: var(--color-text);
              background: var(--color-bg);
              min-height: 100dvh;
              line-height: 1.6;
            }
            img, svg { display: block; max-width: 100%; }
            button { cursor: pointer; border: none; background: none; font: inherit; color: inherit; }
            a { color: inherit; text-decoration: none; }
            :focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; border-radius: var(--radius-sm); }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
            }
            ::selection { background: oklch(from var(--color-primary, #ea580c) l c h / 0.15); }

            .container { max-width: 1120px; margin-inline: auto; padding-inline: var(--space-6); }
            .container--narrow { max-width: 800px; margin-inline: auto; padding-inline: var(--space-6); }
            .sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap; }

            .nav-wrap {
              position: fixed; left: 0; right: 0; top: 0; z-index: 50;
              display: flex; justify-content: center;
              padding: var(--space-4) var(--space-4) 0;
            }
            .nav {
              width: 100%; max-width: 1120px;
              display: flex; align-items: center; justify-content: space-between;
              height: 3.5rem; padding-inline: var(--space-5);
              border-radius: var(--radius-full);
              transition: background var(--transition), box-shadow var(--transition), backdrop-filter var(--transition);
            }
            .nav.scrolled {
              background: color-mix(in oklch, var(--color-surface) 85%, transparent);
              backdrop-filter: blur(16px) saturate(160%);
              box-shadow: var(--shadow-sm), 0 0 0 1px oklch(from var(--color-text, #1a1714) l c h / 0.06);
            }
            .nav-brand { display:flex; align-items:center; gap:var(--space-2); }
            .nav-brand span { font-size: var(--text-sm); font-weight: 700; letter-spacing: -0.02em; color: var(--color-text); }
            .nav-links { display:flex; align-items:center; gap:var(--space-8); }
            .nav-links a { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-muted); transition: color var(--transition); }
            .nav-links a:hover { color: var(--color-primary); }
            .nav-actions { display:flex; align-items:center; gap:var(--space-3); }
            .btn-ghost { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); transition: color var(--transition), background var(--transition); }
            .btn-ghost:hover { color: var(--color-primary); background: var(--color-primary-light); }
            .btn-primary {
              display: inline-flex; align-items: center; gap: var(--space-2);
              font-size: var(--text-sm); font-weight: 600; color: #fff;
              background: var(--color-primary);
              padding: var(--space-2) var(--space-5);
              border-radius: var(--radius-full);
              box-shadow: 0 1px 2px oklch(from var(--color-primary, #ea580c) l c h / 0.3);
              transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
            }
            .btn-primary:hover { background: var(--color-primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px oklch(from var(--color-primary, #ea580c) l c h / 0.35); }
            .btn-primary:active { transform: translateY(0); }
            .nav-mobile-toggle { display:none; align-items:center; justify-content:center; width:2.25rem; height:2.25rem; border-radius:var(--radius-md); color:var(--color-text-muted); transition: color var(--transition), background var(--transition); }
            .nav-mobile-toggle:hover { color:var(--color-text); background:var(--color-surface-offset); }
            .mobile-nav {
              display: none; flex-direction: column; gap: var(--space-1);
              position: fixed; left: var(--space-4); right: var(--space-4); top: 5.5rem; z-index: 49;
              background: var(--color-surface-2); border-radius: var(--radius-xl);
              padding: var(--space-4);
              box-shadow: var(--shadow-lg), 0 0 0 1px oklch(from var(--color-text, #1a1714) l c h / 0.06);
            }
            .mobile-nav.open { display: flex; }
            .mobile-nav a { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-muted); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); transition: color var(--transition), background var(--transition); }
            .mobile-nav a:hover { color:var(--color-primary); background:var(--color-primary-light); }
            .mobile-nav-divider { height:1px; background:var(--color-divider); margin:var(--space-2) 0; }
            .mobile-nav .btn-primary { width:100%; justify-content:center; }

            @media (max-width: 767px) {
              .nav-links, .nav-actions { display: none; }
              .nav-mobile-toggle { display: flex; }
            }

            .hero {
              position: relative;
              padding: calc(5.5rem + var(--space-16)) var(--space-6) var(--space-20);
              text-align: center;
              overflow: hidden;
            }
            .hero-glow {
              position: absolute; inset: 0; pointer-events: none; z-index: 0;
              background:
                radial-gradient(ellipse 70% 50% at 50% -10%, oklch(from var(--color-primary, #ea580c) l c h / 0.12), transparent),
                radial-gradient(ellipse 40% 30% at 80% 60%, oklch(from var(--color-amber, #d97706) l c h / 0.07), transparent);
            }
            .hero-inner { position: relative; z-index: 1; max-width: 900px; margin-inline: auto; }
            .badge {
              display: inline-flex; align-items: center; gap: var(--space-2);
              background: var(--color-surface-2); border: 1px solid var(--color-border);
              padding: 0.3rem var(--space-3); border-radius: var(--radius-full);
              font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.04em;
              text-transform: uppercase; color: var(--color-primary);
              margin-bottom: var(--space-6); box-shadow: var(--shadow-sm);
            }
            .badge-dot { width:6px;height:6px;border-radius:50%;background:var(--color-primary);flex-shrink:0;animation:pulse-dot 2s ease-in-out infinite; }
            @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
            .hero h1 {
              font-family: var(--font-display);
              font-size: var(--text-hero);
              font-weight: 400;
              line-height: 1.08;
              letter-spacing: -0.03em;
              color: var(--color-text);
              margin-bottom: var(--space-6);
            }
            .hero h1 em { font-style: italic; color: var(--color-primary); }
            .hero-sub {
              font-size: var(--text-lg);
              color: var(--color-text-muted);
              max-width: 580px;
              margin-inline: auto;
              line-height: 1.6;
              margin-bottom: var(--space-8);
            }
            .hero-ctas { display:flex; flex-wrap:wrap; gap:var(--space-3); justify-content:center; margin-bottom:var(--space-8); }
            .btn-hero-dark {
              display: inline-flex; align-items: center; gap: var(--space-2);
              font-size: var(--text-sm); font-weight: 600;
              color: var(--color-text-inverse); background: var(--color-dark);
              padding: 0.75rem var(--space-6); border-radius: var(--radius-full);
              box-shadow: 0 2px 8px oklch(0 0 0 / 0.25);
              transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
            }
            .btn-hero-dark:hover { background: var(--color-dark-hover); transform:translateY(-2px); box-shadow: 0 8px 24px oklch(0 0 0 / 0.3); }
            .btn-hero-ghost {
              display: inline-flex; align-items: center; gap: var(--space-2);
              font-size: var(--text-sm); font-weight: 600;
              color: var(--color-text-muted); background: var(--color-surface-2);
              padding: 0.75rem var(--space-6); border-radius: var(--radius-full);
              border: 1px solid var(--color-border);
              transition: color var(--transition), border-color var(--transition), background var(--transition), transform var(--transition);
            }
            .btn-hero-ghost:hover { color:var(--color-primary); border-color:var(--color-primary); background:var(--color-primary-light); transform:translateY(-1px); }
            .hero-trust { display:flex; flex-wrap:wrap; gap:var(--space-5); justify-content:center; }
            .trust-item { display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-xs); font-weight:600; color:var(--color-text-faint); }
            .trust-item svg { width:14px; height:14px; color: var(--color-primary-mid); }

            .preview-wrap { margin-top: var(--space-16); position: relative; }
            .preview-frame {
              background: var(--color-surface-2);
              border-radius: var(--radius-2xl);
              border: 1px solid var(--color-divider);
              box-shadow: var(--shadow-xl);
              overflow: hidden;
            }
            .preview-browser-bar {
              display: flex; align-items: center;
              height: 3rem; padding-inline: var(--space-5);
              background: var(--color-surface);
              border-bottom: 1px solid var(--color-divider);
              gap: var(--space-4);
            }
            .browser-dots { display:flex; gap:5px; }
            .browser-dot { width:10px;height:10px;border-radius:50%; }
            .browser-dot:nth-child(1) { background:#f87171; }
            .browser-dot:nth-child(2) { background:#fbbf24; }
            .browser-dot:nth-child(3) { background:#4ade80; }
            .browser-url {
              flex: 1; max-width: 260px; margin-inline: auto;
              background: var(--color-surface-2);
              border: 1px solid var(--color-divider);
              border-radius: var(--radius-md);
              height: 1.75rem;
              display: flex; align-items: center; justify-content: center; gap: 6px;
              font-size: 11px; font-weight: 500; color: var(--color-text-faint);
            }
            .preview-body { display: grid; grid-template-columns: 1fr 280px; }
            @media (max-width: 767px) { .preview-body { grid-template-columns: 1fr; } }
            .preview-globe {
              display: flex; align-items: center; justify-content: center;
              padding: var(--space-8);
              border-right: 1px solid var(--color-divider);
              background: radial-gradient(ellipse at center, oklch(from var(--color-primary, #ea580c) l c h / 0.04) 0%, transparent 65%);
              min-height: 380px;
            }
            @media (max-width: 767px) { .preview-globe { border-right: none; border-bottom: 1px solid var(--color-divider); min-height: 260px; } }
            .preview-sidebar {
              display: flex; flex-direction: column; gap: var(--space-4);
              padding: var(--space-6);
              background: var(--color-surface);
            }
            .sidebar-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-faint); margin-bottom: var(--space-1); }
            .metric-card {
              display: flex; align-items: center; gap: var(--space-3);
              background: var(--color-surface-2);
              border: 1px solid var(--color-divider);
              border-radius: var(--radius-lg);
              padding: var(--space-3) var(--space-4);
              transition: border-color var(--transition), box-shadow var(--transition);
            }
            .metric-card:hover { border-color: oklch(from var(--color-primary, #ea580c) l c h / 0.35); box-shadow: var(--shadow-sm); }
            .metric-icon { font-size: 1.4rem; width:2.5rem;height:2.5rem;display:flex;align-items:center;justify-content:center;background:var(--color-primary-light);border-radius:var(--radius-md);flex-shrink:0; }
            .metric-label { font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 500; }
            .metric-value { font-size: var(--text-xl); font-weight: 700; color: var(--color-text); line-height: 1.1; }
            .globe-svg { width: 100%; max-width: 380px; overflow: visible; filter: drop-shadow(0 8px 32px oklch(from var(--color-primary, #ea580c) l c h / 0.15)); }

            .section { padding: var(--space-20) var(--space-6); }
            .section--white { background: var(--color-surface-2); border-top: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); }
            .section-eyebrow {
              display: inline-block;
              font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
              color: var(--color-primary);
              background: var(--color-primary-light);
              padding: 0.25rem 0.75rem; border-radius: var(--radius-full);
              margin-bottom: var(--space-4);
            }
            .section-heading {
              font-family: var(--font-display);
              font-size: var(--text-2xl);
              font-weight: 400;
              line-height: 1.12;
              letter-spacing: -0.025em;
              color: var(--color-text);
              margin-bottom: var(--space-4);
            }
            .section-subtext { font-size: var(--text-base); color: var(--color-text-muted); max-width: 520px; line-height: 1.65; }

            #features { padding: var(--space-20) var(--space-6); }
            .bento-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              grid-template-rows: auto;
              gap: var(--space-3);
              margin-top: var(--space-12);
            }
            @media (max-width: 1023px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 639px) { .bento-grid { grid-template-columns: 1fr; } }
            .bento-card {
              background: var(--color-surface-2);
              border: 1px solid var(--color-divider);
              border-radius: var(--radius-xl);
              padding: var(--space-6);
              transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
              display: flex; flex-direction: column; gap: var(--space-4);
              position: relative; overflow: hidden;
              cursor: pointer;
            }
            .bento-card::before {
              content:''; position:absolute; inset:0; opacity:0;
              background: radial-gradient(ellipse at top left, oklch(from var(--color-primary, #ea580c) l c h / 0.06), transparent 60%);
              transition: opacity var(--transition);
            }
            .bento-card:hover { border-color: oklch(from var(--color-primary, #ea580c) l c h / 0.4); box-shadow: var(--shadow-md); transform:translateY(-2px); }
            .bento-card:hover::before { opacity:1; }
            .bento-wide { grid-column: span 2; }
            .bento-tall { grid-row: span 2; }
            @media (max-width: 1023px) { .bento-wide { grid-column: span 1; } .bento-tall { grid-row: span 1; } }
            .bento-icon {
              display: flex; align-items: center; justify-content: center;
              width: 2.5rem; height: 2.5rem;
              background: var(--color-surface-offset);
              border-radius: var(--radius-md);
              color: var(--color-text-muted);
              transition: background var(--transition), color var(--transition);
            }
            .bento-card:hover .bento-icon { background: var(--color-primary); color: #fff; }
            .bento-badge {
              position:absolute; top:var(--space-5); right:var(--space-5);
              font-size: var(--text-xs); font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
              padding: 2px 8px; border-radius:var(--radius-full);
              background: var(--color-primary-light); color: var(--color-primary);
            }
            .bento-title { font-size: var(--text-base); font-weight: 700; color: var(--color-text); display:flex; align-items:center; gap:var(--space-2); }
            .bento-title svg { width:14px;height:14px;opacity:0;transform:translateX(-6px);transition:opacity var(--transition),transform var(--transition); color:var(--color-primary); }
            .bento-card:hover .bento-title svg { opacity:1;transform:translateX(0); }
            .bento-desc { font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.6; }

            .workflow-grid { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-16); align-items:center; }
            @media (max-width: 767px) { .workflow-grid { grid-template-columns:1fr; gap:var(--space-12); } }
            .workflow-steps { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); }
            @media (max-width: 480px) { .workflow-steps { grid-template-columns:1fr; } }
            .step-card {
              background: var(--color-surface-2); border: 1px solid var(--color-divider);
              border-radius: var(--radius-lg); padding: var(--space-5);
              display:flex;flex-direction:column;gap:var(--space-3);
              transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
            }
            .step-card:hover { border-color: oklch(from var(--color-primary, #ea580c) l c h / 0.3); background:var(--color-surface-2); box-shadow:var(--shadow-sm); }
            .step-top { display:flex; align-items:center; justify-content:space-between; }
            .step-icon-wrap { display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;background:var(--color-primary-light);border-radius:var(--radius-md);color:var(--color-primary); }
            .step-num { font-family:monospace;font-size:var(--text-xs);font-weight:700;color:var(--color-text-faint); }
            .step-card:hover .step-num { color:var(--color-primary); }
            .step-title { font-size:var(--text-sm);font-weight:700;color:var(--color-text); }
            .step-desc { font-size:var(--text-xs);color:var(--color-text-muted); }
            .social-proof { display:flex; align-items:center; gap:var(--space-4); margin-top:var(--space-8); }
            .avatars { display:flex; }
            .avatar { width:2rem;height:2rem;border-radius:50%;background:var(--color-surface-offset);border:2px solid var(--color-surface-2);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--color-text-muted); }
            .avatar:first-child { margin-left:0; }
            .social-proof-text { font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted); }
            .social-proof-text strong { color:var(--color-text); }

            .sectors-grid { display:flex; flex-wrap:wrap; gap:var(--space-3); justify-content:center; margin-top:var(--space-12); }
            .sector-pill {
              display:flex; align-items:center; gap:var(--space-3);
              background:var(--color-surface-2); border:1px solid var(--color-divider);
              border-radius:var(--radius-full); padding:var(--space-2) var(--space-5) var(--space-2) var(--space-3);
              transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
              cursor:pointer;
            }
            .sector-pill:hover { border-color:oklch(from var(--color-primary, #ea580c) l c h / 0.4); box-shadow:var(--shadow-sm); transform:translateY(-1px); }
            .sector-dot { width:8px;height:8px;border-radius:50%;background:var(--color-primary);flex-shrink:0;opacity:0.6;transition:opacity var(--transition); }
            .sector-pill:hover .sector-dot { opacity:1; }
            .sector-name { font-size:var(--text-sm);font-weight:700;color:var(--color-text); }
            .sector-hook { font-size:var(--text-xs);color:var(--color-text-faint); }

            .faq-list { border-top:1px solid var(--color-divider); margin-top:var(--space-12); }
            .faq-item { border-bottom:1px solid var(--color-divider); }
            .faq-trigger {
              width:100%; display:flex; align-items:center; justify-content:space-between; gap:var(--space-4);
              padding:var(--space-5) 0; text-align:left;
              background:none; border:none; cursor:pointer;
            }
            .faq-trigger:hover .faq-q { color:var(--color-primary); }
            .faq-q { font-size:var(--text-sm); font-weight:600; color:var(--color-text); transition:color var(--transition); }
            .faq-item.open .faq-q { color:var(--color-primary); }
            .faq-chevron { width:1.5rem;height:1.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--color-text-faint);flex-shrink:0; }
            .faq-answer p { font-size:var(--text-sm); color:var(--color-text-muted); line-height:1.7; padding-bottom:var(--space-5); max-width:600px; }

            .cta-section {
              padding: var(--space-20) var(--space-6);
              text-align:center;
              background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%);
              border-top:1px solid var(--color-divider);
            }
            .cta-logo { margin-inline:auto; margin-bottom:var(--space-6); }
            .cta-heading { font-family:var(--font-display); font-size:var(--text-2xl); font-weight:400; letter-spacing:-0.02em; color:var(--color-text); margin-bottom:var(--space-4); }
            .cta-sub { font-size:var(--text-base); color:var(--color-text-muted); max-width:440px; margin-inline:auto; margin-bottom:var(--space-8); }
            .cta-buttons { display:flex; flex-wrap:wrap; gap:var(--space-3); justify-content:center; }

            footer {
              background: var(--color-surface-2);
              border-top: 1px solid var(--color-divider);
              padding: var(--space-8) var(--space-6);
            }
            .footer-inner { display:flex; align-items:center; justify-content:space-between; gap:var(--space-4); flex-wrap:wrap; max-width:1120px; margin-inline:auto; }
            .footer-brand { display:flex;align-items:center;gap:var(--space-2); font-size:var(--text-sm); font-weight:700; color:var(--color-text); }
            .footer-year { color:var(--color-text-faint); font-weight:400; }
            .footer-links { display:flex; gap:var(--space-6); }
            .footer-links a { font-size:var(--text-xs); font-weight:600; color:var(--color-text-faint); transition:color var(--transition); }
            .footer-links a:hover { color:var(--color-primary); }

            /* Custom scrollbar */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            ::-webkit-scrollbar-track {
              background: var(--color-bg);
            }
            ::-webkit-scrollbar-thumb {
              background: color-mix(in oklch, var(--color-text-faint) 20%, transparent);
              border-radius: var(--radius-full);
              border: 2px solid var(--color-bg);
            }
            ::-webkit-scrollbar-thumb:hover {
              background: color-mix(in oklch, var(--color-text-faint) 40%, transparent);
            }
          `,
        }}
      />
    </>
  )
}