import { TavilySearch } from "@langchain/tavily";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage as AIMessageType } from "@langchain/core/messages";
import { AGENT_SYSTEM_PROMPT } from "../../config/systemPrompts.js";
import { INDIAN_TRADE_DOMAINS } from "../../config/constants.js";
import { buildLangChainLLM, type LcProvider } from "../../providers/langchain.js";
import { buildProfileContext } from "../../utils/profileContext.js";
import { ENV } from "../../config/env.js";
import type { Message, UserProfile, TavilyResult } from "../../types/index.js";

// ── LangGraph state ───────────────────────────────────────────────────────────

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (existing, update) => existing.concat(update),
    default: () => [],
  }),
});

// ── Tool factory ──────────────────────────────────────────────────────────────

function buildTools() {
  if (!ENV.TAVILY_API_KEY) return [];

  const webSearch = new TavilySearch({
    tavilyApiKey: ENV.TAVILY_API_KEY,
    maxResults: 5,
    searchDepth: "advanced",
    includeAnswer: false,
    includeRawContent: false,
  });
  webSearch.name = "web_search";
  webSearch.description =
    "Search the web for the latest information about Indian export procedures, DGFT notifications, FTA updates, government schemes, HS codes, ICEGATE advisories, and global trade. Input: a focused search query.";

  const newsSearch = new TavilySearch({
    tavilyApiKey: ENV.TAVILY_API_KEY,
    maxResults: 5,
    searchDepth: "advanced",
    topic: "news",
    timeRange: "month",
    includeAnswer: false,
    includeRawContent: false,
    includeDomains: INDIAN_TRADE_DOMAINS,
  });
  newsSearch.name = "news_search";
  newsSearch.description =
    "Search recent news (last 30 days) specifically about Indian exports, customs, trade policy, DGFT, and government announcements. Input: a focused search query.";

  return [webSearch, newsSearch];
}

// ── Agent cache — keyed by provider, cleared when API keys change ─────────────

type AgentInstance = ReturnType<typeof createReactAgent>;
const agentCache = new Map<LcProvider, AgentInstance>();

export function clearAgentCache(): void {
  agentCache.clear();
}

function getAgent(provider: LcProvider): AgentInstance {
  const cached = agentCache.get(provider);
  if (cached) return cached;

  const llm = buildLangChainLLM(provider);
  const tools = buildTools();

  // createReactAgent accepts stateSchema to type the graph state properly
  const agent = createReactAgent({
    llm,
    tools,
    prompt: AGENT_SYSTEM_PROMPT,
    stateSchema: AgentState,
  });

  agentCache.set(provider, agent);
  return agent;
}

// ── Message conversion ────────────────────────────────────────────────────────

function toLangChainMessages(messages: Message[]): BaseMessage[] {
  return messages.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
  );
}

// ── Public: stream agent events ───────────────────────────────────────────────

export async function* streamAgentEvents(
  messages: Message[],
  options: { abortSignal?: AbortSignal; provider?: LcProvider; userProfile?: UserProfile } = {},
) {
  const { abortSignal, provider = "openai", userProfile } = options;

  if (!ENV.TAVILY_API_KEY) {
    yield {
      event: "config_error" as const,
      message:
        "Web search is not configured. Add TAVILY_API_KEY to backend/.env (free tier at tavily.com gives 1,000 searches/month).",
    };
    return;
  }

  const agent = getAgent(provider);
  const lcMessages = toLangChainMessages(messages);
  const profileCtx = buildProfileContext(userProfile);

  const inputMessages: BaseMessage[] = profileCtx
    ? [new SystemMessage(profileCtx), ...lcMessages]
    : lcMessages;

  const stream = agent.streamEvents(
    { messages: inputMessages },
    { version: "v2", signal: abortSignal },
  );

  for await (const event of stream) {
    yield event;
  }
}

// ── Public: direct news search (bypasses LLM) ────────────────────────────────

function safeParseJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}

export async function searchNews(
  query: string,
  options: { abortSignal?: AbortSignal } = {},
): Promise<TavilyResult[]> {
  if (!ENV.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY not configured");

  const tool = new TavilySearch({
    tavilyApiKey: ENV.TAVILY_API_KEY,
    maxResults: 8,
    searchDepth: "basic",
    topic: "news",
    timeRange: "month",
    includeAnswer: false,
    includeRawContent: false,
    includeDomains: INDIAN_TRADE_DOMAINS,
  });

  const raw = await tool.invoke({ query }, { signal: options.abortSignal });
  const parsed = typeof raw === "string"
    ? (safeParseJson(raw) as { results?: TavilyResult[] } | null)
    : (raw as { results?: TavilyResult[] });

  return parsed?.results ?? [];
}

// ── Explicit StateGraph (alternative to createReactAgent, for custom flows) ───

export function buildExplicitAgentGraph(provider: LcProvider = "openai") {
  const llm = buildLangChainLLM(provider);
  const tools = buildTools();
  const toolNode = new ToolNode(tools);
  const llmWithTools = tools.length > 0 ? llm.bindTools(tools) : llm;

  return new StateGraph(AgentState)
    .addNode("agent", async (state) => {
      const response = await (llmWithTools as typeof llm).invoke(state.messages);
      return { messages: [response] };
    })
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", (state) => {
      const last = state.messages[state.messages.length - 1] as AIMessageType;
      const hasCalls =
        "tool_calls" in last &&
        Array.isArray(last.tool_calls) &&
        last.tool_calls.length > 0;
      return hasCalls ? "tools" : "__end__";
    })
    .addEdge("tools", "agent")
    .compile();
}
