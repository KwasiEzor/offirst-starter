import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

import { POST } from './route'
import { getPayloadClient } from '@/lib/payload'

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}))

describe('/api/sync/push', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects stale updates when the server version is newer', async () => {
    const payload = {
      auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
      findByID: vi.fn().mockResolvedValue({
        id: 'cat-1',
        updatedAt: '2026-04-04T10:10:00.000Z',
      }),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    }

    vi.mocked(getPayloadClient).mockResolvedValue(payload as never)

    const response = await POST(
      createRequest({
        changes: {
          categories: {
            created: [],
            updated: [
              {
                id: 'local-1',
                serverId: 'cat-1',
                server_updated_at: new Date(
                  '2026-04-04T10:00:00.000Z'
                ).getTime(),
                name: 'Category One',
                slug: 'category-one',
              },
            ],
            deleted: [],
          },
        },
      })
    )

    const data = await response.json()

    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'categories',
        id: 'cat-1',
      })
    )
    expect(payload.update).not.toHaveBeenCalled()
    expect(data.ok).toBe(false)
    expect(data.errors).toEqual([
      {
        collection: 'categories',
        id: 'local-1',
        error: 'Conflict: server version changed since last sync',
      },
    ])
  })
})

function createRequest(body: unknown): NextRequest {
  return {
    headers: new Headers(),
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}
