import type { CollectionAfterDeleteHook } from 'payload'
import { sql } from 'drizzle-orm'

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
      const timestamp = new Date().toISOString()
      const userId = req.user?.id ? String(req.user.id) : null

      await req.payload.db.drizzle.execute(
        sql`
          INSERT INTO sync_log (collection, document_id, operation, timestamp, user_id)
          VALUES (${collectionSlug}, ${String(doc.id)}, 'delete', ${timestamp}, ${userId})
          ON CONFLICT (collection, document_id)
          DO UPDATE SET operation = 'delete', timestamp = ${timestamp}, user_id = ${userId}
        `
      )
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
