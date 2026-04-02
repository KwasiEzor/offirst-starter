/**
 * Sync utilities for offline-first synchronization
 * Implements server-wins conflict resolution strategy
 */

// Types for sync operations
export interface SyncPullRequest {
  lastSyncedAt: string | null
  collections: string[]
}

export interface SyncPullResponse {
  changes: {
    [collection: string]: {
      created: SyncRecord[]
      updated: SyncRecord[]
      deleted: string[]
    }
  }
  timestamp: string
}

export interface SyncPushRequest {
  changes: {
    [collection: string]: {
      created: SyncRecord[]
      updated: SyncRecord[]
      deleted: string[]
    }
  }
}

export interface SyncPushResponse {
  ok: boolean
  errors?: SyncError[]
  serverChanges?: {
    [collection: string]: {
      created: SyncRecord[]
      updated: SyncRecord[]
    }
  }
}

export interface SyncRecord {
  id: string
  serverId?: string
  [key: string]: unknown
}

export interface SyncError {
  collection: string
  id: string
  error: string
}

export interface SyncLogEntry {
  id: number
  collection: string
  document_id: string
  operation: 'create' | 'update' | 'delete'
  timestamp: string
  user_id: string | null
}

/**
 * Syncable collections - must match both Payload and WatermelonDB
 */
export const SYNCABLE_COLLECTIONS = ['categories', 'posts'] as const
export type SyncableCollection = (typeof SYNCABLE_COLLECTIONS)[number]

/**
 * Check if a collection is syncable
 */
export function isSyncableCollection(
  collection: string
): collection is SyncableCollection {
  return SYNCABLE_COLLECTIONS.includes(collection as SyncableCollection)
}

/**
 * Transform Payload document to WatermelonDB format
 */
export function payloadToWatermelon(
  collection: SyncableCollection,
  doc: Record<string, unknown>
): SyncRecord {
  const base = {
    serverId: String(doc.id),
    created_at: new Date(doc.createdAt as string).getTime(),
    updated_at: new Date(doc.updatedAt as string).getTime(),
    synced_at: Date.now(),
    is_dirty: false,
  }

  switch (collection) {
    case 'categories':
      return {
        ...base,
        id: String(doc.id),
        name: doc.name as string,
        slug: doc.slug as string,
        description: (doc.description as string) || null,
        color: (doc.color as string) || null,
      }

    case 'posts':
      return {
        ...base,
        id: String(doc.id),
        title: doc.title as string,
        slug: doc.slug as string,
        excerpt: (doc.excerpt as string) || null,
        content: JSON.stringify(doc.content),
        featured_image_id: doc.featuredImage
          ? String(
              typeof doc.featuredImage === 'object'
                ? (doc.featuredImage as Record<string, unknown>).id
                : doc.featuredImage
            )
          : null,
        author_id: String(
          typeof doc.author === 'object'
            ? (doc.author as Record<string, unknown>).id
            : doc.author
        ),
        status: doc.status as string,
        published_at: doc.publishedAt
          ? new Date(doc.publishedAt as string).getTime()
          : null,
      }

    default:
      throw new Error(`Unknown collection: ${collection}`)
  }
}

/**
 * Transform WatermelonDB record to Payload format
 */
export function watermelonToPayload(
  collection: SyncableCollection,
  record: SyncRecord
): Record<string, unknown> {
  switch (collection) {
    case 'categories':
      return {
        name: record.name,
        slug: record.slug,
        description: record.description || undefined,
        color: record.color || undefined,
      }

    case 'posts':
      return {
        title: record.title,
        slug: record.slug,
        excerpt: record.excerpt || undefined,
        content: record.content ? JSON.parse(record.content as string) : null,
        featuredImage: record.featured_image_id || undefined,
        author: record.author_id,
        status: record.status,
        publishedAt: record.published_at
          ? new Date(record.published_at as number).toISOString()
          : undefined,
      }

    default:
      throw new Error(`Unknown collection: ${collection}`)
  }
}

/**
 * Server-wins conflict resolution
 * Returns true if server version should be used
 */
export function shouldUseServerVersion(
  serverUpdatedAt: number,
  localUpdatedAt: number
): boolean {
  // Server always wins in case of conflict
  return serverUpdatedAt >= localUpdatedAt
}

/**
 * Generate a temporary ID for new records
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Check if an ID is a temporary ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp_')
}

/**
 * Parse ISO date string to timestamp
 */
export function parseTimestamp(isoString: string | null): number {
  if (!isoString) return 0
  return new Date(isoString).getTime()
}

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString()
}
