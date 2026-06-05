import type { SseEvent } from "../types";

export function formatSse(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Creates a ReadableStream for SSE in Next.js.
 * @param onStart - Callback called when stream starts, provides a way to send events.
 * @param onCancel - Optional cleanup callback.
 */
export function createSseStream(
  onStart: (send: (event: SseEvent) => void) => void | Promise<void>,
  onCancel?: () => void
): ReadableStream {
  const encoder = new TextEncoder();
  let heartbeat: NodeJS.Timeout;

  return new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        try {
          controller.enqueue(encoder.encode(formatSse(event)));
        } catch {
          // Stream might be closed
        }
      };

      // Heartbeat
      heartbeat = setInterval(() => {
        send({ type: "heartbeat" });
      }, 20_000);

      try {
        await onStart(send);
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        clearInterval(heartbeat);
        try { controller.close(); } catch { /* ignore */ }
      }
    },
    cancel() {
      clearInterval(heartbeat);
      if (onCancel) onCancel();
    },
  });
}
