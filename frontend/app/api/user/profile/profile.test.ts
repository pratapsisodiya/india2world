import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from './route';
import { getPool } from '@/lib/server/config/db';
import { auth } from '@clerk/nextjs/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_123' }),
}));

vi.mock('@/lib/server/config/db', () => {
  const mockQuery = vi.fn();
  const mockPool = {
    query: mockQuery,
  };
  return {
    getPool: vi.fn().mockReturnValue(mockPool),
  };
});

describe('User Profile API Route (Serverless)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);
  });

  it('retrieves user profile via GET', async () => {
    const mockProfile = {
      user_id: 'user_123',
      business_name: 'John Exports Ltd',
      email: 'user@example.com',
      name: 'John Doe',
    };

    const mockPool = getPool();
    vi.mocked(mockPool.query).mockResolvedValue({
      rows: [mockProfile],
    } as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.business_name).toBe('John Exports Ltd');
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM user_profiles'),
      ['user_123']
    );
  });

  it('updates user profile via PUT', async () => {
    const mockPool = getPool();
    vi.mocked(mockPool.query).mockResolvedValue({ rows: [] } as any);

    const body = {
      business_name: 'New Name Exports',
      sector: 'Textiles',
    };

    const req = new NextRequest('http://localhost/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_profiles'),
      expect.arrayContaining(['user_123', 'New Name Exports', 'Textiles'])
    );
  });
});
