import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findBuyers } from './buyerFinderService';
import { getOpenAIClient } from '../../providers/openai';

vi.mock('../../providers/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL_LARGE: 'gpt-4o-mini',
}));

vi.mock('@langchain/tavily', () => {
  return {
    TavilySearch: class {
      name = 'TavilySearch';
      description = 'Tavily Search Tool';
      invoke = vi.fn().mockResolvedValue(
        JSON.stringify({
          results: [
            { title: 'Gulf Importers', url: 'https://gulfimports.ae', content: 'Gulf spice importers list' },
          ],
        })
      );
    },
  };
});

describe('Buyer Finder Feature (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches web and extracts genuine buyers using OpenAI', async () => {
    const mockJson = {
      buyers: [
        {
          companyName: 'Gulf Food Importers',
          country: 'UAE',
          type: 'Importer',
          website: 'https://gulffood.ae',
          email: 'import@gulffood.ae',
          productCategories: ['spices'],
          notes: 'Specializes in Indian spices',
          sourceUrl: 'https://gulfimports.ae',
        },
      ],
      searchSummary: 'Market is highly active in UAE',
      outreachTips: ['Reach out with quality certifications'],
      verificationNote: 'Always verify buyer credentials',
    };

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockJson) } }],
    });

    vi.mocked(getOpenAIClient).mockReturnValue({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    } as any);

    const result = await findBuyers({
      product: 'black pepper',
      targetCountry: 'UAE',
    });

    expect(getOpenAIClient).toHaveBeenCalled();
    expect(result.buyers.length).toBe(1);
    expect(result.buyers[0].companyName).toBe('Gulf Food Importers');
  });
});
