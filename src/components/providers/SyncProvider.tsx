'use client'

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'

import { useSync, type SyncStatus } from '@/hooks/useSync'

interface SyncContextValue {
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  isOnline: boolean
  sync: () => Promise<void>
  pull: () => Promise<void>
  push: () => Promise<void>
}

const SyncContext = createContext<SyncContextValue | null>(null)

interface SyncProviderProps {
  children: ReactNode
  /**
   * Auto sync interval in milliseconds (default: 30000 = 30s)
   * Set to 0 to disable auto sync
   */
  autoSyncInterval?: number
  /**
   * Sync on mount (default: true)
   */
  syncOnMount?: boolean
  /**
   * Sync when coming back online (default: true)
   */
  syncOnReconnect?: boolean
}

/**
 * Provider for sync functionality
 *
 * Features:
 * - Auto sync at configurable intervals
 * - Sync on mount
 * - Sync when network reconnects
 * - Online/offline detection
 */
export function SyncProvider({
  children,
  autoSyncInterval = 30000,
  syncOnMount = true,
  syncOnReconnect = true,
}: SyncProviderProps) {
  const syncHook = useSync()
  const { sync, checkOnline, isOnline } = syncHook
  const hasSyncedOnMount = useRef(false)

  // Sync on mount
  useEffect(() => {
    if (syncOnMount && !hasSyncedOnMount.current) {
      hasSyncedOnMount.current = true
      sync()
    }
  }, [syncOnMount, sync])

  // Auto sync interval
  useEffect(() => {
    if (autoSyncInterval <= 0) return

    const interval = setInterval(() => {
      if (isOnline) {
        sync()
      }
    }, autoSyncInterval)

    return () => clearInterval(interval)
  }, [autoSyncInterval, isOnline, sync])

  // Handle online/offline events
  const handleOnline = useCallback(() => {
    checkOnline().then(online => {
      if (online && syncOnReconnect) {
        sync()
      }
    })
  }, [checkOnline, sync, syncOnReconnect])

  const handleOffline = useCallback(() => {
    checkOnline()
  }, [checkOnline])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  // Handle visibility change (sync when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOnline) {
        sync()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOnline, sync])

  return (
    <SyncContext.Provider value={syncHook}>{children}</SyncContext.Provider>
  )
}

/**
 * Hook to access sync context
 */
export function useSyncContext(): SyncContextValue {
  const context = useContext(SyncContext)

  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider')
  }

  return context
}

/**
 * Hook to check sync status
 */
export function useSyncStatus(): SyncStatus {
  const { status } = useSyncContext()
  return status
}

/**
 * Hook to check if currently online
 */
export function useIsOnline(): boolean {
  const { isOnline } = useSyncContext()
  return isOnline
}

export default SyncProvider
