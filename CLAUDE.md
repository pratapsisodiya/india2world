# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`backend/`)
```bash
npm run dev    # Development server with auto-reload (tsx watch)
npm run build  # Compile TypeScript → dist/
npm start      # Production server (runs compiled dist/server.js)
```

### Frontend (`frontend/`)
```bash
npm run dev    # Next.js dev server
npm run build  # Production build
npm run lint   # ESLint
```

### Environment setup
- Backend: copy `backend/.env.example` → `backend/.env`, fill in `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `PORT=4000`, `FRONTEND_ORIGIN=http://localhost:3000`
- Frontend: copy `frontend/.env.local.example` → `frontend/.env.local`, set `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`

## Architecture

India2World is an AI-powered export guidance app for Indian businesses. It has a lean Node.js/Express backend and a Next.js frontend.

### Backend (`backend/src/`) — TypeScript, feature-sliced architecture

```
src/
├── server.ts                      # Express entry point — wires all routers
├── config/
│   ├── env.ts                     # Typed env vars, multi-origin CORS list
│   ├── constants.ts               # Trade domains, section queries, TTLs
│   └── systemPrompts.ts           # All AI system prompts (chat, agent, matcher, classifier)
├── types/
│   └── index.ts                   # Zod schemas + inferred TS types for all requests/responses
├── middleware/
│   ├── requestId.ts               # UUID per request, X-Request-Id header
│   ├── requestLogger.ts           # Structured HTTP request logging
│   ├── timeout.ts                 # Per-request timeout (skips SSE routes)
│   └── errorHandler.ts            # 404 + global error handler
├── providers/
│   ├── anthropic.ts               # Singleton Anthropic client
│   ├── gemini.ts                  # Singleton Google GenAI client
│   └── langchain.ts               # LangChain LLM factory (Claude / Groq)
├── utils/
│   ├── logger.ts                  # Structured logger (JSON in prod, readable in dev)
│   ├── ttlCache.ts                # Generic TTL cache with auto-eviction
│   ├── sse.ts                     # SSE helpers: openSse (with heartbeat), sendSse
│   └── profileContext.ts          # User profile → system prompt context string
└── features/
    ├── chat/
    │   ├── chatService.ts         # streamClaude, streamGroq, streamGemini
    │   └── chatRouter.ts          # POST /api/chat
    ├── agent/
    │   ├── agentService.ts        # LangGraph ReAct agent, searchNews, clearAgentCache
    │   └── agentRouter.ts         # POST /api/agent (SSE)
    ├── news/
    │   └── newsRouter.ts          # GET /api/news/exports
    ├── schemeMatcher/
    │   ├── schemeMatcherService.ts # AI scheme matching with 1h TTL cache
    │   └── schemeMatcherRouter.ts  # POST /api/schemes/match
    └── hsClassifier/
        ├── hsClassifierService.ts  # AI HS code classification with 24h TTL cache
        └── hsClassifierRouter.ts   # POST /api/hs/classify
```

**API endpoints:**
- `GET /` — Health check v2 with feature flags
- `GET /api/providers` — Available LLM providers and models
- `POST /api/chat` — Multi-provider SSE chat (Claude / Groq / Gemini)
- `POST /api/agent` — LangGraph ReAct agent with web+news search (SSE)
- `GET /api/news/exports?section=general` — Live trade news feed
- `POST /api/schemes/match` — AI scheme matcher (JSON response)
- `POST /api/hs/classify` — AI HS code classifier (JSON response)

### Frontend (`frontend/`)
Next.js App Router with two route groups:

**Public routes** (`app/(public)/`):
- `/` — Landing page with sector showcase, hero, capabilities
- `/chat` — Main user-facing chat interface; fetches `POST /api/chat` with streaming and renders SSE chunks in real time using React Markdown (GFM)
- `/login`, `/signup` — Placeholder auth pages

**Dashboard routes** (`app/(dashboard)/`):
- `/dashboard` — Hub with quick actions and sector links
- `/dashboard/glossary` — 60+ export terms (static data in `app/data/glossary.ts`)
- `/dashboard/hs-codes` — HS code lookup (static data in `app/data/hsCodes.ts`)
- `/dashboard/schemes` — Government export schemes (static data in `app/data/schemes.ts`)

**Components** (`components/`):
- `ui/` — Reusable primitives: Globe visualization, AnimatedCounter, Badge, FilterTabs, SearchInput, ThemeToggle
- `layout/` — Header, Footer, Sidebar
- `dashboard/` — Dashboard-specific components
- `setu-ai/` — AI chat-specific components

**Theme**: Dark/light mode managed by `providers/ThemeProvider.tsx`, persisted in `localStorage`.

### Chat streaming flow
1. Frontend `POST /api/chat` with `{ messages: [...] }`
2. Backend creates an Anthropic streaming request (SSE) with the cached system prompt
3. Text deltas stream back as `text: <chunk>\n\n` SSE events; `done: true` signals completion
4. Frontend appends chunks to the last assistant message in React state
5. On error mid-stream, the partial assistant message is preserved rather than discarded
