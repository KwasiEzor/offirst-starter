'use client'

import { useEffect, useState } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'

import { useSyncContext } from '@/components/providers'

export default function SyncStatusCard() {
  const database = useDatabase()
  const { status, isOnline, lastSyncedAt, sync, error } = useSyncContext()
  const [pendingCounts, setPendingCounts] = useState({
    categories: 0,
    posts: 0,
  })

  useEffect(() => {
    const categorySubscription = database
      .get('categories')
      .query(Q.where('is_dirty', true))
      .observe()
      .subscribe(records => {
        setPendingCounts(prev => ({ ...prev, categories: records.length }))
      })

    const postSubscription = database
      .get('posts')
      .query(Q.where('is_dirty', true))
      .observe()
      .subscribe(records => {
        setPendingCounts(prev => ({ ...prev, posts: records.length }))
      })

    return () => {
      categorySubscription.unsubscribe()
      postSubscription.unsubscribe()
    }
  }, [database])

  const pendingChanges = pendingCounts.categories + pendingCounts.posts

  const statusLabel = !isOnline
    ? 'Offline'
    : status === 'syncing'
      ? 'Syncing'
      : status === 'error'
        ? 'Attention'
        : pendingChanges > 0
          ? 'Pending changes'
          : 'Synced'

  const statusTone = !isOnline
    ? 'text-gray-600 dark:text-gray-300'
    : status === 'syncing'
      ? 'text-yellow-600 dark:text-yellow-400'
      : status === 'error'
        ? 'text-red-600 dark:text-red-400'
        : pendingChanges > 0
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-green-600 dark:text-green-400'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Sync Status
          </h3>
          <p className={`mt-2 text-3xl font-semibold ${statusTone}`}>
            {statusLabel}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pendingChanges > 0
              ? `${pendingChanges} local change${pendingChanges === 1 ? '' : 's'} waiting to sync`
              : lastSyncedAt
                ? `Last synced ${new Date(lastSyncedAt).toLocaleString()}`
                : 'No sync completed yet'}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {isOnline && (
          <button
            onClick={() => sync()}
            disabled={status === 'syncing'}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {status === 'syncing' ? 'Syncing...' : 'Sync now'}
          </button>
        )}
      </div>
    </div>
  )
}
