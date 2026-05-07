import type { Response } from "express";
import type { Message } from "../../types/index.js";
import { getOpenAIClient, OPENAI_MODEL } from "../../providers/openai.js";
import { getGeminiClient, GEMINI_MODEL } from "../../providers/gemini.js";
import { BASE_SYSTEM_PROMPT } from "../../config/systemPrompts.js";
import { sendSse } from "../../utils/sse.js";

// ── OpenAI (default) ──────────────────────────────────────────────────────────

export async function streamOpenAI(
  messages: Message[],
  profileCtx: string,
  res: Response,
  signal: AbortSignal,
): Promise<void> {
  const client = getOpenAIClient();
  const systemContent = [BASE_SYSTEM_PROMPT, profileCtx].filter(Boolean).join("\n\n");

  const stream = await client.chat.completions.create(
    {
      model: OPENAI_MODEL,
      max_tokens: 4096,
      messages: [{ role: "system", content: systemContent }, ...messages],
      stream: true,
    },
    { signal },
  );

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) sendSse(res, { type: "text", text: delta });
  }
}

// ── Gemini (optional) ─────────────────────────────────────────────────────────

export async function streamGemini(
  messages: Message[],
  profileCtx: string,
  res: Response,
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
    signal ? { signal } as never : undefined,
  );

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) sendSse(res, { type: "text", text });
  }
}
