'use client'

import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from './schema'
import migrations from './migrations'
import { modelClasses } from './models'

/**
 * Singleton database instance
 * Uses LokiJS adapter with IndexedDB persistence for browser
 */
let database: Database | null = null

/**
 * Get or create the WatermelonDB database instance
 * Safe to call multiple times - returns the same instance
 *
 * @throws Error if called on the server (no window object)
 */
export function getDatabase(): Database {
  // Safety check for SSR
  if (typeof window === 'undefined') {
    throw new Error(
      'getDatabase() can only be called on the client. ' +
        'Use dynamic import with ssr: false or wrap in useEffect.'
    )
  }

  if (database) {
    return database
  }

  const adapter = new LokiJSAdapter({
    schema,
    migrations,
    useWebWorker: false, // Disable web worker for simpler debugging
    useIncrementalIndexedDB: true, // Enable IndexedDB persistence
    dbName: 'offirst_db',
    // Optional: callback when database is ready
    onSetUpError: error => {
      console.error('WatermelonDB setup error:', error)
    },
  })

  database = new Database({
    adapter,
    modelClasses,
  })

  return database
}

/**
 * Reset the database (useful for logout or testing)
 * Deletes all data and resets the singleton
 */
export async function resetDatabase(): Promise<void> {
  if (database) {
    await database.write(async () => {
      await database!.unsafeResetDatabase()
    })
    database = null
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return database !== null
}

export { database }
export default getDatabase
