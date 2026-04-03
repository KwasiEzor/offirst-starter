'use client'

import { useRouter } from 'next/navigation'

import { logout } from '@/lib/auth'
import { useSyncContext } from '@/components/providers'

interface HeaderProps {
  user: {
    email: string
    name?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { status, isOnline, sync } = useSyncContext()

  async function handleLogout() {
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Offirst
        </h1>

        {/* Sync status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              !isOnline
                ? 'bg-gray-400'
                : status === 'syncing'
                  ? 'animate-pulse bg-yellow-400'
                  : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-green-500'
            }`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {!isOnline
              ? 'Offline'
              : status === 'syncing'
                ? 'Syncing...'
                : status === 'error'
                  ? 'Sync error'
                  : 'Synced'}
          </span>
          {isOnline && status !== 'syncing' && (
            <button
              onClick={() => sync()}
              className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sync now
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {user.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
