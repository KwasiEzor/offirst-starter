import type { CollectionAfterChangeHook } from 'payload'

import { appendSyncLogEntry } from '@/lib/server/sync-log'

/**
 * Hook factory that logs document changes to sync_log table
 * Used for offline-first sync with WatermelonDB
 */
export const trackChange = (
  collectionSlug: string
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req }) => {
    // Skip if no database connection (during seed/migration)
    if (!req.payload.db) return doc

    try {
      const userId = req.user?.id ? String(req.user.id) : null

      await appendSyncLogEntry(req.payload.db, {
        collection: collectionSlug,
        documentId: String(doc.id),
        operation,
        userId,
      })
    } catch (error) {
      // Log but don't fail the operation
      req.payload.logger.error({
        msg: 'Failed to track change in sync_log',
        collection: collectionSlug,
        documentId: doc.id,
        error,
      })
    }

    return doc
  }
}
