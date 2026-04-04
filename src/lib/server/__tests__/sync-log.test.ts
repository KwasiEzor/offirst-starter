import { describe, expect, it } from 'vitest'

import { reduceSyncLogRows, type SyncLogRow } from '@/lib/server/sync-log'

describe('reduceSyncLogRows', () => {
  function row(
    id: number,
    documentId: string,
    operation: SyncLogRow['operation']
  ): SyncLogRow {
    return {
      id,
      collection: 'categories',
      document_id: documentId,
      operation,
      timestamp: '2026-04-04T12:00:00.000Z',
      user_id: 'user-1',
    }
  }

  it('keeps create plus update as a created record', () => {
    const result = reduceSyncLogRows([
      row(1, 'doc-1', 'create'),
      row(2, 'doc-1', 'update'),
    ])

    expect(result.createdIds).toEqual(['doc-1'])
    expect(result.updatedIds).toEqual([])
    expect(result.deletedIds).toEqual([])
  })

  it('collapses create plus delete to no-op', () => {
    const result = reduceSyncLogRows([
      row(1, 'doc-1', 'create'),
      row(2, 'doc-1', 'delete'),
    ])

    expect(result.createdIds).toEqual([])
    expect(result.updatedIds).toEqual([])
    expect(result.deletedIds).toEqual([])
  })

  it('keeps update plus delete as a delete', () => {
    const result = reduceSyncLogRows([
      row(1, 'doc-1', 'update'),
      row(2, 'doc-1', 'delete'),
    ])

    expect(result.createdIds).toEqual([])
    expect(result.updatedIds).toEqual([])
    expect(result.deletedIds).toEqual(['doc-1'])
  })

  it('tracks independent documents separately', () => {
    const result = reduceSyncLogRows([
      row(1, 'doc-1', 'update'),
      row(2, 'doc-2', 'create'),
      row(3, 'doc-3', 'delete'),
    ])

    expect(result.createdIds).toEqual(['doc-2'])
    expect(result.updatedIds).toEqual(['doc-1'])
    expect(result.deletedIds).toEqual(['doc-3'])
  })
})
