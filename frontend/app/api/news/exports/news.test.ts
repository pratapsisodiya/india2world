import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as agentService from '@/lib/server/features/agent/agentService';
import * as rssFetcher from '@/lib/server/utils/rssFetcher';
import { ENV } from '@/lib/server/config/env';

describe('News API Route (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ENV as any).TAVILY_API_KEY = 'tvly-test-tavily-key';
  });

  it('fetches news via searchNews when TAVILY_API_KEY is present', async () => {
    const mockNews = [
      { title: 'Tavily News', url: 'https://tavily.com/1', content: 'Tavily content' }
    ];
    const searchNewsSpy = vi.spyOn(agentService, 'searchNews').mockResolvedValue(mockNews);

    const req = new NextRequest('http://localhost/api/news/exports?section=general');
    const res = await GET(req);
    const data = await res.json();

    expect(searchNewsSpy).toHaveBeenCalledWith('India exports news latest announcements DGFT trade policy');
    expect(res.status).toBe(200);
    expect(data.items[0].title).toBe('Tavily News');
  });

  it('fetches news via fetchRssNews when TAVILY_API_KEY is missing', async () => {
    (ENV as any).TAVILY_API_KEY = undefined;

    const mockRssNews = [
      { title: 'RSS News', url: 'https://rss.com/1', content: 'RSS content' }
    ];
    const fetchRssNewsSpy = vi.spyOn(rssFetcher, 'fetchRssNews').mockResolvedValue(mockRssNews);
    const searchNewsSpy = vi.spyOn(agentService, 'searchNews');

    // Add refresh=1 to bypass the cache from the previous test
    const req = new NextRequest('http://localhost/api/news/exports?section=general&refresh=1');
    const res = await GET(req);
    const data = await res.json();

    expect(fetchRssNewsSpy).toHaveBeenCalled();
    expect(searchNewsSpy).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(data.items[0].title).toBe('RSS News');
  });
});
