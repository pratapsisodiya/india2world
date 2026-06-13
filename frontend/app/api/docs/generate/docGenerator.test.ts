import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { getOpenAIClient } from '@/lib/server/providers/openai';

vi.mock('@/lib/server/providers/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL_LARGE: 'gpt-4o-mini',
}));

describe('Doc Generator API Route (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a document and streams SSE events', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: { content: '# Invoice' } }] };
        yield { choices: [{ delta: { content: '\n- Line 1' } }] };
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

    const body = {
      docType: 'proforma-invoice',
      exporterName: 'Exporter Inc',
      exporterAddress: '123 Exporter St',
      buyerName: 'Buyer LLC',
      buyerAddress: '456 Buyer Rd',
      products: [
        {
          description: 'Cotton Yarn',
          hsCode: '5205',
          quantity: '1000 kg',
          unitPrice: 5.5,
        },
      ],
      incoterm: 'FOB',
    };

    const req = new NextRequest('http://localhost/api/docs/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toContain('data: ' + JSON.stringify({ type: 'text', text: '# Invoice' }));
    expect(text).toContain('data: ' + JSON.stringify({ type: 'text', text: '\n- Line 1' }));
    expect(text).toContain('data: ' + JSON.stringify({ type: 'done' }));
  });
});
