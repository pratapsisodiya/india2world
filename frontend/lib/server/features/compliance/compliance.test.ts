import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screenEntity } from './complianceService';
import { getOpenAIClient } from '../../providers/openai';

vi.mock('../../providers/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL_LARGE: 'gpt-4o-mini',
}));

describe('Compliance Screening Feature (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('screens entities using OpenAI and validates risk format', async () => {
    const mockJson = {
      status: 'warning',
      riskScore: 50,
      matchedLists: ['BIS Entity List'],
      reasoning: 'Potential match with Russian entities.',
      countryStatus: 'Targeted Sanctions',
      recommendation: 'Perform enhanced due diligence.',
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

    const result = await screenEntity({
      entityName: 'VTB Logistics',
      country: 'Russia',
      entityType: 'company',
    });

    expect(getOpenAIClient).toHaveBeenCalled();
    expect(result.status).toBe('warning');
    expect(result.riskScore).toBe(50);
  });
});
