import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamOpenAI, streamGemini } from './chatService';
import { getOpenAIClient } from '../../providers/openai';
import { getGeminiClient } from '../../providers/gemini';

vi.mock('../../providers/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL: 'gpt-4o-mini',
}));

vi.mock('../../providers/gemini', () => ({
  getGeminiClient: vi.fn(),
  GEMINI_MODEL: 'gemini-2.0-flash',
}));

describe('Chat Feature (Serverless)', () => {
  let mockSend: any;

  beforeEach(() => {
    mockSend = vi.fn();
  });

  describe('streamOpenAI', () => {
    it('streams response chunks from OpenAI', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockStream);
      vi.mocked(getOpenAIClient).mockReturnValue({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as any);

      const signal = new AbortController().signal;
      await streamOpenAI([{ role: 'user', content: 'Hi' }], 'Profile Context', mockSend, signal);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith({ type: 'text', text: 'Hello' });
      expect(mockSend).toHaveBeenCalledWith({ type: 'text', text: ' world' });
    });
  });

  describe('streamGemini', () => {
    it('streams response chunks from Gemini', async () => {
      const mockResultStream = {
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Hello' };
            yield { text: () => ' Gemini' };
          },
        },
      };

      const mockSendMessageStream = vi.fn().mockResolvedValue(mockResultStream);
      const mockStartChat = vi.fn().mockReturnValue({
        sendMessageStream: mockSendMessageStream,
      });

      vi.mocked(getGeminiClient).mockReturnValue({
        getGenerativeModel: vi.fn().mockReturnValue({
          startChat: mockStartChat,
        }),
      } as any);

      const signal = new AbortController().signal;
      await streamGemini([{ role: 'user', content: 'Hi' }], 'Profile Context', mockSend, signal);

      expect(mockSendMessageStream).toHaveBeenCalledWith('Hi', expect.any(Object));
      expect(mockSend).toHaveBeenCalledWith({ type: 'text', text: 'Hello' });
      expect(mockSend).toHaveBeenCalledWith({ type: 'text', text: ' Gemini' });
    });
  });
});
