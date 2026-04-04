import type { CollectionAfterDeleteHook } from 'payload'

import { appendSyncLogEntry } from '@/lib/server/sync-log'

/**
 * Hook factory that logs document deletions to sync_log table
 * Used for offline-first sync with WatermelonDB
 */
export const trackDelete = (
  collectionSlug: string
): CollectionAfterDeleteHook => {
  return async ({ doc, req }) => {
    // Skip if no database connection (during seed/migration)
    if (!req.payload.db) return doc

    try {
      const userId = req.user?.id ? String(req.user.id) : null

      await appendSyncLogEntry(req.payload.db, {
        collection: collectionSlug,
        documentId: String(doc.id),
        operation: 'delete',
        userId,
      })
    } catch (error) {
      // Log but don't fail the operation
      req.payload.logger.error({
        msg: 'Failed to track delete in sync_log',
        collection: collectionSlug,
        documentId: doc.id,
        error,
      })
    }

    return doc
  }
}
