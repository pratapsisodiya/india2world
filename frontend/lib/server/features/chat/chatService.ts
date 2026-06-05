import OpenAI from "openai";
import type { Message, SseEvent } from "../../types";
import { getOpenAIClient, OPENAI_MODEL } from "../../providers/openai";
import { getGeminiClient, GEMINI_MODEL } from "../../providers/gemini";
import { BASE_SYSTEM_PROMPT } from "../../config/systemPrompts";
import { CHAT_TOOLS, executeTool } from "./chatTools";

type SendFn = (event: SseEvent) => void;

// ── OpenAI — streaming with tool-call loop ────────────────────────────────────

export async function streamOpenAI(
  messages: Message[],
  profileCtx: string,
  send: SendFn,
  signal: AbortSignal,
): Promise<void> {
  const client = getOpenAIClient();
  const systemContent = [BASE_SYSTEM_PROMPT, profileCtx].filter(Boolean).join("\n\n");

  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...messages as any[],
  ];

  // Agentic loop — re-prompt after each round of tool calls (max 5 rounds)
  for (let round = 0; round < 5; round++) {
    if (signal.aborted) return;

    const stream = await client.chat.completions.create(
      {
        model: OPENAI_MODEL,
        max_tokens: 4096,
        messages: apiMessages,
        tools: CHAT_TOOLS,
        tool_choice: "auto",
        stream: true,
      },
      { signal },
    );

    let finishReason: string | null = null;
    let assistantText = "";
    const toolCallMap = new Map<number, { id: string; name: string; arguments: string }>();

    for await (const chunk of stream) {
      if (signal.aborted) return;
      const choice = chunk.choices[0];
      if (!choice) continue;

      if (choice.finish_reason) finishReason = choice.finish_reason;
      const delta = choice.delta;

      if (delta.content) {
        assistantText += delta.content;
        send({ type: "text", text: delta.content });
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const entry = toolCallMap.get(tc.index) ?? { id: "", name: "", arguments: "" };
          if (tc.id) entry.id = tc.id;
          if (tc.function?.name) entry.name = tc.function.name;
          if (tc.function?.arguments) entry.arguments += tc.function.arguments;
          toolCallMap.set(tc.index, entry);
        }
      }
    }

    if (finishReason !== "tool_calls" || toolCallMap.size === 0) break;

    const toolCalls = Array.from(toolCallMap.values());

    apiMessages.push({
      role: "assistant",
      content: assistantText || null,
      tool_calls: toolCalls.map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    for (const tc of toolCalls) {
      if (signal.aborted) return;

      send({ type: "tool_start", tool: tc.name, input: tc.arguments });

      let toolResult: string;
      try {
        const args = JSON.parse(tc.arguments) as Record<string, unknown>;
        toolResult = await executeTool(tc.name, args, signal);
      } catch (err) {
        toolResult = JSON.stringify({
          error: err instanceof Error ? err.message : "Tool execution failed",
        });
      }

      send({ type: "tool_end", tool: tc.name, resultCount: 1 });

      apiMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: toolResult,
      });
    }
  }
}

// ── Gemini — text-only streaming ──────────────────────────────────────────────

export async function streamGemini(
  messages: Message[],
  profileCtx: string,
  send: SendFn,
  signal: AbortSignal,
): Promise<void> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: [BASE_SYSTEM_PROMPT, profileCtx].filter(Boolean).join("\n\n"),
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1]!;
  const chat = model.startChat({ history });

  const result = await chat.sendMessageStream(
    lastMessage.content,
    signal ? ({ signal } as any) : undefined,
  );

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) send({ type: "text", text });
  }
}
