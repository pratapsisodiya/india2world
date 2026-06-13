import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyHsCode } from './hsClassifierService';
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

describe('HS Classifier Feature (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ENV as any).OPENAI_API_KEY = 'sk-test-openai-key';
    (ENV as any).GEMINI_API_KEY = 'AIzaSy-test-gemini-key';
  });

  it('classifies HS codes using OpenAI when active', async () => {
    const mockJson = {
      topMatches: [
        {
          chapter: '52',
          heading: '5208',
          chapterTitle: 'Cotton',
          headingDescription: 'Woven fabrics of cotton',
          confidence: 0.95,
          reasoning: 'Matches woven cotton description',
          itcHsNote: 'Standard export documentation applies',
          regulatoryFlags: [],
        },
      ],
      generalGuidance: 'Ensure fabric specifications are clear',
      verifyAt: 'DGFT website',
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

    const result = await classifyHsCode({
      productDescription: 'handwoven cotton sarees',
      sector: 'Textiles',
    });

    expect(getOpenAIClient).toHaveBeenCalled();
    expect(result.topMatches[0].chapter).toBe('52');
    expect(result.topMatches[0].heading).toBe('5208');
  });

  it('classifies HS codes using Gemini when OpenAI is inactive', async () => {
    (ENV as any).OPENAI_API_KEY = undefined; // Disable OpenAI

    const mockJson = {
      topMatches: [
        {
          chapter: '09',
          heading: '0904',
          chapterTitle: 'Spices',
          headingDescription: 'Pepper of the genus Piper',
          confidence: 0.98,
          reasoning: 'Matches black pepper',
          itcHsNote: 'Subject to Spices Board clearance',
          regulatoryFlags: [],
        },
      ],
      generalGuidance: 'Check Spices Board registration',
      verifyAt: 'DGFT / Spices Board',
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

    const result = await classifyHsCode({
      productDescription: 'whole black pepper',
      sector: 'Spices',
    });

    expect(getGeminiClient).toHaveBeenCalled();
    expect(result.topMatches[0].chapter).toBe('09');
    expect(result.topMatches[0].heading).toBe('0904');
  });
});
