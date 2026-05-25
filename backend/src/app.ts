import "./config/env.js"; // load dotenv first
import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { ENV } from "./config/env.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { requestTimeout } from "./middleware/timeout.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";

import chatRouter from "./features/chat/chatRouter.js";
import agentRouter from "./features/agent/agentRouter.js";
import newsRouter from "./features/news/newsRouter.js";
import schemeMatcherRouter from "./features/schemeMatcher/schemeMatcherRouter.js";
import hsClassifierRouter from "./features/hsClassifier/hsClassifierRouter.js";
import userRouter from "./features/user/userRouter.js";
import buyerFinderRouter from "./features/buyerFinder/buyerFinderRouter.js";
import docGeneratorRouter from "./features/docGenerator/docGeneratorRouter.js";
import complianceRouter from "./features/compliance/complianceRouter.js";

const app = express();

// Multi-origin CORS
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) {
        cb(null, true);
        return;
      }
      if (ENV.FRONTEND_ORIGINS.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

// Core middleware
app.use(compression());
app.use(express.json({ limit: "256kb" }));
app.use(requestId);
app.use(requestLogger);
app.use(requestTimeout);

// Rate limiting
function makeLimit(max: number, message: string) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
}

app.use("/api/chat", makeLimit(ENV.CHAT_RATE_LIMIT, "Chat rate limit reached. Please wait before sending more messages."));
app.use("/api/agent", makeLimit(ENV.AGENT_RATE_LIMIT, "Research agent rate limit reached. Please wait before running another search."));
app.use("/api/schemes/match", makeLimit(ENV.SCHEME_RATE_LIMIT, "Scheme matcher rate limit reached."));
app.use("/api/hs/classify", makeLimit(ENV.HS_RATE_LIMIT, "HS classifier rate limit reached."));
app.use("/api/buyers/find", makeLimit(10, "Buyer finder rate limit reached. Please wait."));
app.use("/api/docs/generate", makeLimit(20, "Document generator rate limit reached."));

// Health check (v2)
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "india2world-backend",
    version: "0.3.0",
    features: {
      chat: !!(ENV.OPENAI_API_KEY || ENV.GEMINI_API_KEY),
      agent: !!((ENV.OPENAI_API_KEY || ENV.GEMINI_API_KEY) && ENV.TAVILY_API_KEY),
      news: !!ENV.TAVILY_API_KEY,
      schemeMatcher: !!ENV.OPENAI_API_KEY,
      hsClassifier: !!ENV.OPENAI_API_KEY,
      database: !!ENV.DATABASE_URL,
      auth: !!ENV.CLERK_SECRET_KEY,
      providers: {
        openai: !!ENV.OPENAI_API_KEY,
        gemini: !!ENV.GEMINI_API_KEY,
      },
    },
  });
});

// Detailed providers endpoint
app.get("/api/providers", (_req, res) => {
  res.json({
    available: [ENV.OPENAI_API_KEY ? "openai" : null, ENV.GEMINI_API_KEY ? "gemini" : null].filter(Boolean),
    default: "openai",
    models: {
      openai: "gpt-4o-mini",
      gemini: "gemini-2.0-flash",
    },
  });
});

// Feature routers
app.use(chatRouter);
app.use(agentRouter);
app.use(newsRouter);
app.use(schemeMatcherRouter);
app.use(hsClassifierRouter);
app.use(userRouter);
app.use(buyerFinderRouter);
app.use(docGeneratorRouter);
app.use(complianceRouter);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;