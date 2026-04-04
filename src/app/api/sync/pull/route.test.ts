import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import type * as SyncLogModule from '@/lib/server/sync-log'

import { POST } from './route'
import { getPayloadClient } from '@/lib/payload'
import { getLatestSyncCursor } from '@/lib/server/sync-log'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

vi.mock('@/lib/server/sync-log', async importOriginal => {
  const actual = (await importOriginal()) as typeof SyncLogModule

  return {
    ...actual,
    getLatestSyncCursor: vi.fn(),
  }
})

describe('/api/sync/pull', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a created record when the sync log contains create then update', async () => {
    const payload = {
      auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue({
            rows: [
              {
                id: 11,
                collection: 'categories',
                document_id: 'cat-1',
                operation: 'create',
                timestamp: '2026-04-04T10:00:00.000Z',
                user_id: 'user-1',
              },
              {
                id: 12,
                collection: 'categories',
                document_id: 'cat-1',
                operation: 'update',
                timestamp: '2026-04-04T10:05:00.000Z',
                user_id: 'user-1',
              },
            ],
          }),
        },
      },
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'cat-1',
            name: 'Category One',
            slug: 'category-one',
            description: null,
            color: null,
            createdAt: '2026-04-04T10:00:00.000Z',
            updatedAt: '2026-04-04T10:05:00.000Z',
          },
        ],
      }),
    }

    vi.mocked(getPayloadClient).mockResolvedValue(payload as never)
    vi.mocked(getLatestSyncCursor).mockResolvedValue(12)

    const response = await POST(
      createRequest({
        cursor: '10',
        collections: ['categories'],
      })
    )

    const data = await response.json()

    expect(payload.find).toHaveBeenCalledTimes(1)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'categories',
        where: { id: { in: ['cat-1'] } },
      })
    )
    expect(data.cursor).toBe('12')
    expect(data.changes.categories.created).toHaveLength(1)
    expect(data.changes.categories.updated).toEqual([])
    expect(data.changes.categories.deleted).toEqual([])
  })
})

function createRequest(body: unknown): NextRequest {
  return {
    headers: new Headers(),
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}
