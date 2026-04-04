import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

import { getPayloadClient } from '@/lib/payload'
import {
  type SyncPullRequest,
  type SyncPullResponse,
  SYNCABLE_COLLECTIONS,
  isSyncableCollection,
  payloadToWatermelon,
} from '@/lib/sync-utils'

interface SyncLogRow {
  id: number
  collection: string
  document_id: string
  operation: 'create' | 'update' | 'delete'
  timestamp: string
  user_id: string | null
}

/**
 * POST /api/sync/pull
 *
 * Pull changes from server since last sync
 * Returns created, updated, and deleted records for each collection
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const user = await payload.auth({ headers: request.headers })

    // Require authentication
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as SyncPullRequest
    const { lastSyncedAt, collections = SYNCABLE_COLLECTIONS } = body

    // Filter to only syncable collections
    const syncCollections = collections.filter(isSyncableCollection)

    const changes: SyncPullResponse['changes'] = {}
    const timestamp = new Date().toISOString()

    for (const collection of syncCollections) {
      changes[collection] = {
        created: [],
        updated: [],
        deleted: [],
      }

      if (lastSyncedAt) {
        // Get changes from sync_log since last sync
        const syncLogResult = await payload.db.drizzle.execute(
          sql`
            SELECT * FROM sync_log
            WHERE collection = ${collection}
            AND timestamp > ${lastSyncedAt}
            ORDER BY timestamp ASC
          `
        )

        const syncLog = (syncLogResult.rows || []) as unknown as SyncLogRow[]

        // Group by operation
        const createIds = new Set<string>()
        const updateIds = new Set<string>()
        const deleteIds = new Set<string>()

        for (const entry of syncLog) {
          switch (entry.operation) {
            case 'create':
              createIds.add(entry.document_id)
              deleteIds.delete(entry.document_id)
              break
            case 'update':
              if (!createIds.has(entry.document_id)) {
                updateIds.add(entry.document_id)
              }
              break
            case 'delete':
              createIds.delete(entry.document_id)
              updateIds.delete(entry.document_id)
              deleteIds.add(entry.document_id)
              break
          }
        }

        // Fetch created documents
        if (createIds.size > 0) {
          const created = await payload.find({
            collection,
            where: { id: { in: Array.from(createIds) } },
            limit: 1000,
          })
          changes[collection]!.created = created.docs.map(doc =>
            payloadToWatermelon(collection, doc as Record<string, unknown>)
          )
        }

        // Fetch updated documents
        if (updateIds.size > 0) {
          const updated = await payload.find({
            collection,
            where: { id: { in: Array.from(updateIds) } },
            limit: 1000,
          })
          changes[collection]!.updated = updated.docs.map(doc =>
            payloadToWatermelon(collection, doc as Record<string, unknown>)
          )
        }

        // Add deleted IDs
        changes[collection]!.deleted = Array.from(deleteIds)
      } else {
        // Initial sync - fetch all documents
        const allDocs = await payload.find({
          collection,
          limit: 10000, // Adjust based on expected data size
          pagination: false,
        })

        changes[collection]!.created = allDocs.docs.map(doc =>
          payloadToWatermelon(collection, doc as Record<string, unknown>)
        )
      }
    }

    const response: SyncPullResponse = {
      changes,
      timestamp,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sync pull error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
