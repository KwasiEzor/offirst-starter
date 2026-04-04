import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

import { getPayloadClient } from '@/lib/payload'
import {
  getLatestSyncCursor,
  reduceSyncLogRows,
  type SyncLogRow,
} from '@/lib/server/sync-log'
import {
  type SyncPullRequest,
  type SyncPullResponse,
  SYNCABLE_COLLECTIONS,
  isSyncableCollection,
  parseSyncCursor,
  payloadToWatermelon,
  serializeSyncCursor,
} from '@/lib/sync-utils'

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
    const {
      cursor = null,
      lastSyncedAt = null,
      collections = SYNCABLE_COLLECTIONS,
    } = body
    const lastEventId = parseSyncCursor(cursor)
    const latestCursor = await getLatestSyncCursor(payload.db)

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

      if (cursor || lastSyncedAt) {
        // Get changes from sync_log since last sync
        const syncLogResult = await payload.db.drizzle.execute(
          cursor
            ? sql`
                SELECT id, collection, document_id, operation, timestamp, user_id
                FROM sync_log
                WHERE collection = ${collection}
                  AND id > ${lastEventId}
                  AND id <= ${latestCursor}
                ORDER BY id ASC
              `
            : sql`
                SELECT id, collection, document_id, operation, timestamp, user_id
                FROM sync_log
                WHERE collection = ${collection}
                  AND timestamp > ${lastSyncedAt}
                  AND id <= ${latestCursor}
                ORDER BY id ASC
              `
        )

        const syncLog = (syncLogResult.rows || []) as unknown as SyncLogRow[]
        const { createdIds, updatedIds, deletedIds } =
          reduceSyncLogRows(syncLog)

        // Fetch created documents
        if (createdIds.length > 0) {
          const created = await payload.find({
            collection,
            where: { id: { in: createdIds } },
            limit: 1000,
          })
          changes[collection]!.created = created.docs.map(doc =>
            payloadToWatermelon(collection, doc as Record<string, unknown>)
          )
        }

        // Fetch updated documents
        if (updatedIds.length > 0) {
          const updated = await payload.find({
            collection,
            where: { id: { in: updatedIds } },
            limit: 1000,
          })
          changes[collection]!.updated = updated.docs.map(doc =>
            payloadToWatermelon(collection, doc as Record<string, unknown>)
          )
        }

        // Add deleted IDs
        changes[collection]!.deleted = deletedIds
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
      cursor: serializeSyncCursor(latestCursor),
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
