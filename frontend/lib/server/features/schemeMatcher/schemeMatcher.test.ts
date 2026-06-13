import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchSchemes } from './schemeMatcherService';
import { getOpenAIClient } from '../../providers/openai';
import { getGeminiClient } from '../../providers/gemini';
import { ENV } from '../../config/env';

vi.mock('../../providers/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL_LARGE: 'gpt-4o-mini',
}));

vi.mock('../../providers/gemini', () => ({
  getGeminiClient: vi.fn(),
  GEMINI_MODEL: 'gemini-2.0-flash',
}));

describe('Scheme Matcher Feature (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ENV as any).OPENAI_API_KEY = 'sk-test-openai-key';
    (ENV as any).GEMINI_API_KEY = 'AIzaSy-test-gemini-key';
  });

  it('recommends schemes using OpenAI when active', async () => {
    const mockJson = {
      recommended: [
        {
          schemeId: 'rodtep',
          schemeName: 'RoDTEP',
          matchScore: 95,
          reason: 'Matches export sector',
          immediateAction: 'Apply online',
          estimatedBenefit: '1.5%',
        },
      ],
      notRecommended: [],
      profileGaps: [],
      summary: 'Matches profile',
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

    const result = await matchSchemes({
      sector: 'Textiles',
      exportProducts: 'sarees',
      businessType: 'manufacturer',
      hasIEC: true,
      hasGST: true,
    });

    expect(getOpenAIClient).toHaveBeenCalled();
    expect(result.recommended[0].schemeId).toBe('rodtep');
    expect(result.summary).toBe('Matches profile');
  });

  it('recommends schemes using Gemini when OpenAI is inactive', async () => {
    (ENV as any).OPENAI_API_KEY = undefined; // Disable OpenAI

    const mockJson = {
      recommended: [
        {
          schemeId: 'epcg',
          schemeName: 'EPCG',
          matchScore: 90,
          reason: 'Matches machinery imports',
          immediateAction: 'Apply online',
          estimatedBenefit: 'Duty savings',
        },
      ],
      notRecommended: [],
      profileGaps: [],
      summary: 'Gemini match',
    };

    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockJson),
      },
    });

    vi.mocked(getGeminiClient).mockReturnValue({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    } as any);

    // Use different parameters than the first test to avoid hitting matchCache
    const result = await matchSchemes({
      sector: 'Engineering',
      exportProducts: 'machinery parts',
      businessType: 'merchant',
      hasIEC: true,
      hasGST: true,
    });

    expect(getGeminiClient).toHaveBeenCalled();
    expect(result.recommended[0].schemeId).toBe('epcg');
  });
});
