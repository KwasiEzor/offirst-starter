'use client'

import { useState, useCallback, useRef } from 'react'
import { useDatabase } from '@nozbe/watermelondb/react'
import { Q, type Collection, type Model } from '@nozbe/watermelondb'

import type {
  SyncPullResponse,
  SyncPushResponse,
  SyncRecord,
  SyncableCollection,
} from '@/lib/sync-utils'
import { SYNCABLE_COLLECTIONS } from '@/lib/sync-utils'
import type Category from '@/db/models/Category'
import type Post from '@/db/models/Post'

type SyncModel = Category | Post

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  isOnline: boolean
}

interface UseSyncReturn extends SyncState {
  sync: () => Promise<void>
  pull: () => Promise<void>
  push: () => Promise<void>
  checkOnline: () => Promise<boolean>
}

const LAST_SYNCED_KEY = 'offirst_last_synced_at'

/**
 * Hook for managing offline-first synchronization
 */
export function useSync(): UseSyncReturn {
  const database = useDatabase()
  const [state, setState] = useState<SyncState>({
    status: 'idle',
    lastSyncedAt:
      typeof window !== 'undefined'
        ? localStorage.getItem(LAST_SYNCED_KEY)
        : null,
    error: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  })

  const syncingRef = useRef(false)

  /**
   * Check if the server is reachable
   */
  const checkOnline = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      })
      const isOnline = response.ok
      setState(prev => ({ ...prev, isOnline }))
      return isOnline
    } catch {
      setState(prev => ({ ...prev, isOnline: false }))
      return false
    }
  }, [])

  /**
   * Pull changes from server
   */
  const pull = useCallback(async (): Promise<void> => {
    const response = await fetch('/api/sync/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        lastSyncedAt: state.lastSyncedAt,
        collections: SYNCABLE_COLLECTIONS,
      }),
    })

    if (!response.ok) {
      throw new Error(`Pull failed: ${response.statusText}`)
    }

    const data: SyncPullResponse = await response.json()

    // Apply changes to local database
    await database.write(async () => {
      for (const [collection, changes] of Object.entries(data.changes)) {
        const table = database.get(collection)

        // Handle created records
        for (const record of changes.created) {
          await upsertServerRecord(
            table,
            record,
            collection as SyncableCollection
          )
        }

        // Handle updated records
        for (const record of changes.updated) {
          await upsertServerRecord(
            table,
            record,
            collection as SyncableCollection
          )
        }

        // Handle deleted records
        for (const serverId of changes.deleted) {
          const existing = await table
            .query(Q.where('server_id', serverId))
            .fetch()

          for (const item of existing) {
            await item.destroyPermanently()
          }
        }
      }
    })

    // Update last synced timestamp
    localStorage.setItem(LAST_SYNCED_KEY, data.timestamp)
    setState(prev => ({ ...prev, lastSyncedAt: data.timestamp }))
  }, [database, state.lastSyncedAt])

  /**
   * Push local changes to server
   */
  const push = useCallback(async (): Promise<void> => {
    const changes: Record<
      string,
      { created: SyncRecord[]; updated: SyncRecord[]; deleted: string[] }
    > = {}

    // Collect dirty records from each collection
    for (const collection of SYNCABLE_COLLECTIONS) {
      const table = database.get(collection)
      const dirtyRecords = await table.query(Q.where('is_dirty', true)).fetch()

      const created: SyncRecord[] = []
      const updated: SyncRecord[] = []

      for (const record of dirtyRecords) {
        const syncRecord = modelToSyncRecord(
          record as Category | Post,
          collection
        )

        if (!syncRecord.serverId) {
          created.push(syncRecord)
        } else {
          updated.push(syncRecord)
        }
      }

      // Get locally deleted records (marked for deletion)
      // For now, we handle deletes through the UI
      const deleted: string[] = []

      changes[collection] = { created, updated, deleted }
    }

    // Skip if no changes
    const hasChanges = Object.values(changes).some(
      c => c.created.length > 0 || c.updated.length > 0 || c.deleted.length > 0
    )

    if (!hasChanges) {
      return
    }

    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ changes }),
    })

    if (!response.ok) {
      throw new Error(`Push failed: ${response.statusText}`)
    }

    const data: SyncPushResponse = await response.json()

    if (!data.ok && data.errors) {
      console.error('Sync push errors:', data.errors)
    }

    // Update local records with server IDs and clear dirty flag
    if (data.serverChanges) {
      await database.write(async () => {
        for (const [collection, serverChanges] of Object.entries(
          data.serverChanges!
        )) {
          const table = database.get(collection)

          for (const serverRecord of serverChanges.created) {
            // Find the local record by matching fields (since it was just created)
            const localRecords = await table
              .query(Q.where('is_dirty', true))
              .fetch()

            for (const local of localRecords) {
              const localModel = local as Category | Post
              if (shouldMatch(localModel, serverRecord, collection)) {
                await localModel.update((model: Category | Post) => {
                  model.serverId = serverRecord.serverId as string
                  model.isDirty = false
                  model.syncedAt = new Date()
                })
                break
              }
            }
          }

          for (const serverRecord of serverChanges.updated) {
            const existing = await table
              .query(Q.where('server_id', serverRecord.serverId as string))
              .fetch()

            if (existing.length > 0) {
              const item = existing[0] as Category | Post
              await item.update((model: Category | Post) => {
                model.isDirty = false
                model.syncedAt = new Date()
              })
            }
          }
        }
      })
    }
  }, [database])

  /**
   * Full sync: pull then push
   */
  const sync = useCallback(async (): Promise<void> => {
    if (syncingRef.current) {
      return
    }

    syncingRef.current = true
    setState(prev => ({ ...prev, status: 'syncing', error: null }))

    try {
      const isOnline = await checkOnline()

      if (!isOnline) {
        setState(prev => ({ ...prev, status: 'offline' }))
        return
      }

      // Pull first (get server changes)
      await pull()

      // Then push (send local changes)
      await push()

      setState(prev => ({ ...prev, status: 'success' }))
    } catch (error) {
      console.error('Sync error:', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed',
      }))
    } finally {
      syncingRef.current = false
    }
  }, [checkOnline, pull, push])

  return {
    ...state,
    sync,
    pull,
    push,
    checkOnline,
  }
}

/**
 * Apply sync record data to WatermelonDB model
 */
function applyRecordToModel(
  model: Category | Post,
  record: SyncRecord,
  collection: SyncableCollection
): void {
  model.serverId = record.serverId as string
  model.isDirty = false
  model.syncedAt = new Date()

  if (collection === 'categories') {
    const cat = model as Category
    cat.name = record.name as string
    cat.slug = record.slug as string
    cat.description = (record.description as string) || null
    cat.color = (record.color as string) || null
  } else if (collection === 'posts') {
    const post = model as Post
    post.title = record.title as string
    post.slug = record.slug as string
    post.excerpt = (record.excerpt as string) || null
    post.content = record.content as string
    post.featuredImageId = (record.featured_image_id as string) || null
    post.authorId = record.author_id as string
    post.status = record.status as 'draft' | 'published' | 'archived'
    post.publishedAt = record.published_at
      ? new Date(record.published_at as number)
      : null
  }
}

async function upsertServerRecord(
  table: Collection<Model>,
  record: SyncRecord,
  collection: SyncableCollection
): Promise<void> {
  const serverId = record.serverId as string | undefined

  if (!serverId) {
    return
  }

  const existing = await table.query(Q.where('server_id', serverId)).fetch()

  if (existing.length === 0) {
    await table.create((item: Model) => {
      applyRecordToModel(item as SyncModel, record, collection)
    })
    return
  }

  const item = existing[0] as Category | Post
  await item.update((model: Category | Post) => {
    applyRecordToModel(model, record, collection)
  })
}

/**
 * Convert WatermelonDB model to sync record
 */
function modelToSyncRecord(
  model: Category | Post,
  collection: string
): SyncRecord {
  const base: SyncRecord = {
    id: model.id,
    serverId: model.serverId || undefined,
  }

  if (collection === 'categories') {
    const cat = model as Category
    return {
      ...base,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
    }
  } else {
    const post = model as Post
    return {
      ...base,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image_id: post.featuredImageId,
      author_id: post.authorId,
      status: post.status,
      published_at: post.publishedAt?.getTime() || null,
    }
  }
}

/**
 * Check if local record matches server record (for newly created records)
 */
function shouldMatch(
  local: Category | Post,
  server: SyncRecord,
  collection: string
): boolean {
  if (collection === 'categories') {
    const cat = local as Category
    return cat.slug === server.slug
  } else {
    const post = local as Post
    return post.slug === server.slug
  }
}

export default useSync
