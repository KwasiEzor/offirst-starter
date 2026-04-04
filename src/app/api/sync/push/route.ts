import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import {
  type SyncPushRequest,
  type SyncPushResponse,
  type SyncError,
  isSyncableCollection,
  hasServerConflict,
  watermelonToPayload,
  isTempId,
  payloadToWatermelon,
  type SyncableCollection,
} from '@/lib/sync-utils'

/**
 * POST /api/sync/push
 *
 * Push local changes to server
 * Handles creates, updates, and deletes for each collection
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const user = await payload.auth({ headers: request.headers })

    // Require authentication
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as SyncPushRequest
    const { changes } = body

    const errors: SyncError[] = []
    const serverChanges: SyncPushResponse['serverChanges'] = {}

    for (const [collection, collectionChanges] of Object.entries(changes)) {
      if (!isSyncableCollection(collection)) {
        continue
      }

      serverChanges[collection] = {
        created: [],
        updated: [],
      }

      // Handle creates
      for (const record of collectionChanges.created) {
        try {
          const data = watermelonToPayload(collection, record)

          // Add author for posts if not set
          if (collection === 'posts' && !data.author) {
            data.author = user.user.id
          }

          const created = await payload.create({
            collection,
            data,
            user: user.user,
          })

          // Return the created record with server ID
          serverChanges[collection]!.created.push(
            payloadToWatermelon(
              collection as SyncableCollection,
              created as Record<string, unknown>
            )
          )
        } catch (error) {
          errors.push({
            collection,
            id: record.id,
            error: error instanceof Error ? error.message : 'Create failed',
          })
        }
      }

      // Handle updates
      for (const record of collectionChanges.updated) {
        try {
          // Skip if no server ID
          const serverId = record.serverId || record.id
          if (isTempId(serverId)) {
            errors.push({
              collection,
              id: record.id,
              error: 'Cannot update record without server ID',
            })
            continue
          }

          const existing = await payload.findByID({
            collection,
            id: serverId,
            depth: 0,
            user: user.user,
          })

          const clientBaseUpdatedAt =
            typeof record.server_updated_at === 'number'
              ? record.server_updated_at
              : null
          const serverUpdatedAt = new Date(
            existing.updatedAt as string
          ).getTime()

          if (hasServerConflict(clientBaseUpdatedAt, serverUpdatedAt)) {
            errors.push({
              collection,
              id: record.id,
              error: 'Conflict: server version changed since last sync',
            })
            continue
          }

          const data = watermelonToPayload(collection, record)

          const updated = await payload.update({
            collection,
            id: serverId,
            data,
            user: user.user,
          })

          serverChanges[collection]!.updated.push(
            payloadToWatermelon(
              collection as SyncableCollection,
              updated as Record<string, unknown>
            )
          )
        } catch (error) {
          errors.push({
            collection,
            id: record.id,
            error: error instanceof Error ? error.message : 'Update failed',
          })
        }
      }

      // Handle deletes
      for (const id of collectionChanges.deleted) {
        try {
          // Skip temp IDs - they were never on server
          if (isTempId(id)) {
            continue
          }

          await payload.delete({
            collection,
            id,
            user: user.user,
          })
        } catch (error) {
          errors.push({
            collection,
            id,
            error: error instanceof Error ? error.message : 'Delete failed',
          })
        }
      }
    }

    const response: SyncPushResponse = {
      ok: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      serverChanges:
        Object.keys(serverChanges).length > 0 ? serverChanges : undefined,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sync push error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
