import { describe, expect, it, vi } from 'vitest'

import { upsertServerRecord } from './useSync'
import type { SyncRecord } from '@/lib/sync-utils'

describe('upsertServerRecord', () => {
  it('creates a local row when an updated server record is missing locally', async () => {
    const createdModels: Array<Record<string, unknown>> = []
    const table = {
      query: vi.fn().mockReturnValue({
        fetch: vi.fn().mockResolvedValue([]),
      }),
      create: vi
        .fn()
        .mockImplementation(async (builder: (item: never) => void) => {
          const model = createCategoryModel()
          builder(model as never)
          createdModels.push(model)
        }),
    }

    await upsertServerRecord(
      table as never,
      createCategoryRecord({
        serverId: 'cat-1',
        updated_at: new Date('2026-04-04T10:05:00.000Z').getTime(),
        server_updated_at: new Date('2026-04-04T10:05:00.000Z').getTime(),
      }),
      'categories'
    )

    expect(table.create).toHaveBeenCalledTimes(1)
    expect(createdModels).toHaveLength(1)
    expect(createdModels[0]).toMatchObject({
      serverId: 'cat-1',
      name: 'Category One',
      slug: 'category-one',
      isDirty: false,
    })
  })

  it('does not overwrite an existing dirty local row', async () => {
    const localModel = createCategoryModel({
      name: 'Local Draft',
      slug: 'local-draft',
      isDirty: true,
    })
    const updateSpy = vi.spyOn(localModel, 'update')

    const table = {
      query: vi.fn().mockReturnValue({
        fetch: vi.fn().mockResolvedValue([localModel]),
      }),
      create: vi.fn(),
    }

    await upsertServerRecord(
      table as never,
      createCategoryRecord({
        serverId: 'cat-1',
        name: 'Server Version',
        slug: 'server-version',
        updated_at: new Date('2026-04-04T10:05:00.000Z').getTime(),
        server_updated_at: new Date('2026-04-04T10:05:00.000Z').getTime(),
      }),
      'categories'
    )

    expect(updateSpy).not.toHaveBeenCalled()
    expect(localModel.name).toBe('Local Draft')
    expect(localModel.slug).toBe('local-draft')
    expect(table.create).not.toHaveBeenCalled()
  })
})

function createCategoryRecord(overrides: Partial<SyncRecord> = {}): SyncRecord {
  return {
    id: 'cat-1',
    serverId: 'cat-1',
    name: 'Category One',
    slug: 'category-one',
    description: null,
    color: null,
    created_at: new Date('2026-04-04T10:00:00.000Z').getTime(),
    updated_at: new Date('2026-04-04T10:00:00.000Z').getTime(),
    server_updated_at: new Date('2026-04-04T10:00:00.000Z').getTime(),
    ...overrides,
  }
}

function createCategoryModel(
  overrides: Partial<Record<string, unknown>> = {}
): Record<string, unknown> & {
  update: (updater: (model: Record<string, unknown>) => void) => Promise<void>
  _raw: Record<string, number | string | null | undefined>
} {
  const model: Record<string, unknown> & {
    update: (updater: (model: Record<string, unknown>) => void) => Promise<void>
    _raw: Record<string, number | string | null | undefined>
  } = {
    id: 'local-1',
    serverId: 'cat-1',
    serverUpdatedAt: null,
    isDirty: false,
    syncedAt: null,
    updatedAt: new Date('2026-04-04T10:00:00.000Z'),
    name: '',
    slug: '',
    description: null,
    color: null,
    _raw: {},
    async update(updater) {
      updater(model)
    },
    ...overrides,
  }

  return model
}
