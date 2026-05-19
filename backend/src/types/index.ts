import { z } from "zod";

// ── Message schemas ───────────────────────────────────────────────────────────

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(32_000),
});

export const UserProfileSchema = z.object({
  businessName: z.string().max(200).optional(),
  sector: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  exportProducts: z.string().max(500).optional(),
  targetMarkets: z.array(z.string().max(50)).max(20).optional(),
  exportStage: z.string().max(50).optional(),
  annualTurnover: z.string().max(50).optional(),
  yearsInBusiness: z.number().int().min(0).max(200).optional(),
  hasIEC: z.boolean().optional(),
  hasGST: z.boolean().optional(),
}).optional();

// ── Request schemas ───────────────────────────────────────────────────────────

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  userProfile: UserProfileSchema,
  provider: z.enum(["openai", "gemini"]).default("openai"),
});

export const AgentRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  userProfile: UserProfileSchema,
  provider: z.enum(["openai", "gemini"]).default("openai"),
});

export const SchemeMatcherRequestSchema = z.object({
  sector: z.string().min(1).max(100),
  exportProducts: z.string().min(1).max(1000),
  exportStage: z.enum(["planning", "registered", "first-shipment", "scaling"]).optional(),
  annualTurnover: z.string().max(50).optional(),
  hasIEC: z.boolean().optional(),
  hasGST: z.boolean().optional(),
  targetMarkets: z.array(z.string().max(50)).max(20).optional(),
  location: z.string().max(100).optional(),
  businessType: z.enum(["manufacturer", "merchant", "service", "unknown"]).default("unknown"),
});

export const HsClassifierRequestSchema = z.object({
  productDescription: z.string().min(3).max(2000),
  sector: z.string().max(100).optional(),
  additionalContext: z.string().max(500).optional(),
});

export const BuyerFinderRequestSchema = z.object({
  product: z.string().min(2).max(500),
  targetCountry: z.string().min(2).max(100),
  hsCode: z.string().max(20).optional(),
  sector: z.string().max(100).optional(),
});

export const ComplianceScreeningRequestSchema = z.object({
  entityName: z.string().min(2).max(200),
  country: z.string().min(2).max(100),
  entityType: z.enum(["company", "individual", "vessel", "unknown"]).default("unknown"),
});

export const DocGeneratorRequestSchema = z.object({
  docType: z.enum(["proforma-invoice", "commercial-invoice", "packing-list", "certificate-of-origin"]),
  exporterName: z.string().min(1).max(200),
  exporterAddress: z.string().min(1).max(500),
  buyerName: z.string().min(1).max(200),
  buyerAddress: z.string().min(1).max(500),
  products: z.array(z.object({
    description: z.string().max(200),
    hsCode: z.string().max(20).optional(),
    quantity: z.string().max(50),
    unitPrice: z.number(),
    currency: z.string().max(5).default("USD"),
  })).min(1).max(20),
  incoterm: z.string().max(10).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  paymentTerms: z.string().max(100).optional(),
});

// ── SSE event types ───────────────────────────────────────────────────────────

export type SseTextEvent = { type: "text"; text: string };
export type SseDoneEvent = { type: "done" };
export type SseErrorEvent = { type: "error"; message: string };
export type SseToolStartEvent = { type: "tool_start"; tool: string; input: string };
export type SseToolEndEvent = { type: "tool_end"; tool: string; resultCount: number };
export type SseSourcesEvent = {
  type: "sources";
  sources: Array<{ title: string; url: string; domain: string; snippet: string }>;
};
export type SseHeartbeatEvent = { type: "heartbeat" };

export type SseEvent =
  | SseTextEvent
  | SseDoneEvent
  | SseErrorEvent
  | SseToolStartEvent
  | SseToolEndEvent
  | SseSourcesEvent
  | SseHeartbeatEvent;

// ── Domain types ──────────────────────────────────────────────────────────────

export type Message = z.infer<typeof MessageSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type SchemeMatcherRequest = z.infer<typeof SchemeMatcherRequestSchema>;
export type HsClassifierRequest = z.infer<typeof HsClassifierRequestSchema>;

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate: string | null;
  score: number | null;
}

export interface NewsPayload {
  section: string;
  items: NewsItem[];
  fetchedAt: number;
  cached: boolean;
}

export interface TavilyResult {
  title?: string;
  url: string;
  content?: string;
  published_date?: string;
  score?: number;
}

export interface SourceEntry {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

// ── Scheme matcher response ───────────────────────────────────────────────────

export interface SchemeRecommendation {
  schemeId: string;
  schemeName: string;
  matchScore: number;
  reason: string;
  immediateAction: string;
  estimatedBenefit: string;
}

export interface SchemeMatcherResponse {
  recommended: SchemeRecommendation[];
  notRecommended: Array<{ schemeId: string; reason: string }>;
  profileGaps: string[];
  summary: string;
}

// ── HS classifier response ────────────────────────────────────────────────────

export interface HsMatch {
  chapter: string;
  heading: string;
  chapterTitle: string;
  headingDescription: string;
  confidence: number;
  reasoning: string;
  itcHsNote: string;
  regulatoryFlags: string[];
}

export interface HsClassifierResponse {
  topMatches: HsMatch[];
  clarificationNeeded?: string;
  generalGuidance: string;
  verifyAt: string;
}

// ── Buyer finder response ─────────────────────────────────────────────────────

export interface Buyer {
  companyName: string;
  country: string;
  type: string;
  website?: string;
  email?: string;
  phone?: string;
  productCategories: string[];
  annualImportVolume?: string;
  notes: string;
  sourceUrl?: string;
}

export interface BuyerFinderResponse {
  buyers: Buyer[];
  searchSummary: string;
  outreachTips: string[];
  verificationNote: string;
}

export type BuyerFinderRequest = import("zod").infer<typeof BuyerFinderRequestSchema>;
export type DocGeneratorRequest = import("zod").infer<typeof DocGeneratorRequestSchema>;
export type ComplianceScreeningRequest = z.infer<typeof ComplianceScreeningRequestSchema>;

export interface ComplianceScreeningResponse {
  status: "clear" | "warning" | "blocked";
  riskScore: number;
  matchedLists: string[];
  reasoning: string;
  countryStatus: string;
  recommendation: string;
}

