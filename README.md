# India2World 🌏

[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)](frontend/package.json)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](backend/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](frontend/package.json)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](README.md)

India2World is an AI-powered export workspace for Indian businesses. It combines a polished Next.js frontend with a lean Node.js backend to help exporters explore schemes, HS codes, market intelligence, compliance checklists, and readiness planning.

## ✨ What it includes

- AI export chat for questions about procedures, markets, HS codes, and schemes
- Scheme matching, HS classification, FTA guidance, and document checklists
- Export readiness flows and dashboard views for saved research
- Clerk-based authentication and protected dashboard routes
- Backend APIs for chat, news, scheme matching, and HS classification

## 🖼 Screenshots

Use this space to drop in real product screenshots later.

| Landing page | Dashboard preview |
| --- | --- |
| Add screenshot here | Add screenshot here |

## 🧱 Project Structure

```text
frontend/   Next.js app, UI components, Clerk auth, dashboard pages
backend/    Node.js API server, AI services, middleware, and routes
```

## 🚀 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## 🔐 Environment Variables

### Frontend

Create `frontend/.env.local` from the example file and set:

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Clerk sign-in and sign-up redirect URLs

### Backend

Create `backend/.env` from the example file and set:

- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `PORT=4000`
- `FRONTEND_ORIGIN=http://localhost:3000`

## 🛠 Useful Commands

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

### Backend

```bash
npm run dev
npm run build
npm start
```

## 🚢 Deploy

- Frontend: Vercel
- Backend: your Node.js host of choice

## 📝 Notes

- The frontend uses Clerk middleware for protected routes.
- Keep production Clerk keys configured in Vercel before deploying.
- Add real screenshots here when you have them.
