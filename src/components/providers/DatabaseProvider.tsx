'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Database } from '@nozbe/watermelondb'
import { DatabaseProvider as WatermelonProvider } from '@nozbe/watermelondb/react'

import { getDatabase, isDatabaseInitialized } from '@/db'

interface DatabaseContextValue {
  database: Database | null
  isReady: boolean
  error: Error | null
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  isReady: false,
  error: null,
})

interface DatabaseProviderProps {
  children: ReactNode
  /**
   * Optional loading component to show while database initializes
   */
  fallback?: ReactNode
}

/**
 * Provider component for WatermelonDB
 *
 * Handles:
 * - Safe initialization on client-side only
 * - Loading state while database initializes
 * - Error handling for initialization failures
 *
 * Usage:
 * ```tsx
 * <DatabaseProvider fallback={<Loading />}>
 *   <App />
 * </DatabaseProvider>
 * ```
 */
export function DatabaseProvider({
  children,
  fallback,
}: DatabaseProviderProps) {
  const [state, setState] = useState<DatabaseContextValue>({
    database: null,
    isReady: false,
    error: null,
  })

  useEffect(() => {
    // Skip if already initialized
    if (isDatabaseInitialized()) {
      setState({
        database: getDatabase(),
        isReady: true,
        error: null,
      })
      return
    }

    try {
      const db = getDatabase()
      setState({
        database: db,
        isReady: true,
        error: null,
      })
    } catch (error) {
      console.error('Failed to initialize database:', error)
      setState({
        database: null,
        isReady: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      })
    }
  }, [])

  // Show fallback while loading
  if (!state.isReady && !state.error) {
    return <>{fallback}</> || null
  }

  // Show error state
  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Database Error</h2>
          <p className="mt-2 text-sm text-gray-600">{state.error.message}</p>
        </div>
      </div>
    )
  }

  // Database is ready
  return (
    <DatabaseContext.Provider value={state}>
      {state.database && (
        <WatermelonProvider database={state.database}>
          {children}
        </WatermelonProvider>
      )}
    </DatabaseContext.Provider>
  )
}

/**
 * Hook to access database context
 *
 * @returns Database context with database instance and status
 * @throws Error if used outside DatabaseProvider
 */
export function useDatabaseContext(): DatabaseContextValue {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabaseContext must be used within DatabaseProvider')
  }
  return context
}

/**
 * Hook to check if database is ready
 */
export function useIsDatabaseReady(): boolean {
  const { isReady } = useDatabaseContext()
  return isReady
}

export default DatabaseProvider
