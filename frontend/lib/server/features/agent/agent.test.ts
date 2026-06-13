import { describe, it, expect, vi } from 'vitest';
import { streamAgentEvents, searchNews } from './agentService';

vi.mock('@langchain/langgraph/prebuilt', () => ({
  createReactAgent: vi.fn().mockReturnValue({
    streamEvents: vi.fn().mockImplementation(async function* () {
      yield { event: 'on_chat_model_stream', name: 'openai', data: { chunk: { content: 'hello agent' } } };
    }),
  }),
  ToolNode: vi.fn(),
}));

vi.mock('@langchain/tavily', () => {
  return {
    TavilySearch: class {
      name = 'TavilySearch';
      description = 'Tavily Search Tool';
      invoke = vi.fn().mockResolvedValue(
        JSON.stringify({
          results: [
            { title: 'Indian Trade Update', url: 'https://trade.gov.in/news1', content: 'Trade details' },
          ],
        })
      );
    },
  };
});

vi.mock('../../providers/langchain', () => ({
  buildLangChainLLM: vi.fn().mockReturnValue({}),
}));

describe('Agent Feature (Serverless)', () => {
  describe('streamAgentEvents', () => {
    it('streams agent events and yields content', async () => {
      const generator = streamAgentEvents([{ role: 'user', content: 'test query' }]);
      const events: any[] = [];
      for await (const event of generator) {
        events.push(event);
      }

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].event).toBe('on_chat_model_stream');
      expect(events[0].data.chunk.content).toBe('hello agent');
    });
  });

  describe('searchNews', () => {
    it('invokes Tavily news search and parses results', async () => {
      const results = await searchNews('DGFT notifications');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Indian Trade Update');
      expect(results[0].url).toBe('https://trade.gov.in/news1');
    });
  });
});
