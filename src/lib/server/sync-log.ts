import { sql } from 'drizzle-orm'

export type SyncLogOperation = 'create' | 'update' | 'delete'

export interface SyncLogRow {
  id: number
  collection: string
  document_id: string
  operation: SyncLogOperation
  timestamp: string
  user_id: string | null
}

interface SyncLogDatabase {
  drizzle: {
    execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }>
  }
}

interface AppendSyncLogEntryOptions {
  collection: string
  documentId: string
  operation: SyncLogOperation
  userId: string | null
}

interface ReducedSyncLogRows {
  createdIds: string[]
  updatedIds: string[]
  deletedIds: string[]
}

let ensureSyncLogSchemaPromise: Promise<void> | null = null

/**
 * Ensure the sync log exists and can store append-only change events.
 * This keeps existing deployments functional even if the SQL migration
 * has not yet been applied manually.
 */
export async function ensureSyncLogSchema(
  db: SyncLogDatabase | null | undefined
): Promise<void> {
  if (!db) {
    return
  }

  if (!ensureSyncLogSchemaPromise) {
    ensureSyncLogSchemaPromise = ensureSyncLogSchemaInternal(db).catch(
      error => {
        ensureSyncLogSchemaPromise = null
        throw error
      }
    )
  }

  await ensureSyncLogSchemaPromise
}

export async function appendSyncLogEntry(
  db: SyncLogDatabase,
  { collection, documentId, operation, userId }: AppendSyncLogEntryOptions
): Promise<void> {
  await ensureSyncLogSchema(db)

  await db.drizzle.execute(
    sql`
      INSERT INTO sync_log (collection, document_id, operation, timestamp, user_id)
      VALUES (${collection}, ${documentId}, ${operation}, NOW(), ${userId})
    `
  )
}

export async function getLatestSyncCursor(
  db: SyncLogDatabase
): Promise<number> {
  await ensureSyncLogSchema(db)

  const result = await db.drizzle.execute(
    sql`
      SELECT COALESCE(MAX(id), 0) AS max_id
      FROM sync_log
    `
  )

  const row = (result.rows?.[0] ?? { max_id: 0 }) as {
    max_id?: number | string | null
  }

  return Number(row.max_id ?? 0)
}

export function reduceSyncLogRows(rows: SyncLogRow[]): ReducedSyncLogRows {
  const operations = new Map<string, SyncLogOperation>()

  for (const row of rows) {
    const previous = operations.get(row.document_id)

    switch (row.operation) {
      case 'create':
        operations.set(row.document_id, 'create')
        break

      case 'update':
        if (!previous) {
          operations.set(row.document_id, 'update')
        }
        break

      case 'delete':
        if (previous === 'create') {
          operations.delete(row.document_id)
        } else {
          operations.set(row.document_id, 'delete')
        }
        break
    }
  }

  const createdIds: string[] = []
  const updatedIds: string[] = []
  const deletedIds: string[] = []

  for (const [documentId, operation] of operations.entries()) {
    switch (operation) {
      case 'create':
        createdIds.push(documentId)
        break
      case 'update':
        updatedIds.push(documentId)
        break
      case 'delete':
        deletedIds.push(documentId)
        break
    }
  }

  return { createdIds, updatedIds, deletedIds }
}

async function ensureSyncLogSchemaInternal(db: SyncLogDatabase): Promise<void> {
  await db.drizzle.execute(
    sql`
      CREATE TABLE IF NOT EXISTS sync_log (
        id SERIAL PRIMARY KEY,
        collection VARCHAR(255) NOT NULL,
        document_id VARCHAR(255) NOT NULL,
        operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        user_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
  )

  await db.drizzle.execute(
    sql`
      ALTER TABLE sync_log
      DROP CONSTRAINT IF EXISTS sync_log_unique_doc
    `
  )

  await db.drizzle.execute(
    sql`
      CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp
      ON sync_log (timestamp)
    `
  )

  await db.drizzle.execute(
    sql`
      CREATE INDEX IF NOT EXISTS idx_sync_log_collection
      ON sync_log (collection)
    `
  )

  await db.drizzle.execute(
    sql`
      CREATE INDEX IF NOT EXISTS idx_sync_log_user_id
      ON sync_log (user_id)
    `
  )

  await db.drizzle.execute(
    sql`
      CREATE INDEX IF NOT EXISTS idx_sync_log_collection_id
      ON sync_log (collection, id)
    `
  )

  await db.drizzle.execute(
    sql`
      CREATE INDEX IF NOT EXISTS idx_sync_log_collection_document_id
      ON sync_log (collection, document_id, id DESC)
    `
  )
}
