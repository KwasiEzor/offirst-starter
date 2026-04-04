'use client'

import type { ReactNode } from 'react'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { DatabaseProvider, SyncProvider } from '@/components/providers'
import type { AuthUser } from '@/lib/auth-client'

interface AppShellClientProps {
  children: ReactNode
  user: AuthUser
}

export function AppShellClient({ children, user }: AppShellClientProps) {
  return (
    <DatabaseProvider
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-2 text-sm text-gray-500">Loading database...</p>
          </div>
        </div>
      }
    >
      <SyncProvider autoSyncInterval={30000} syncOnMount syncOnReconnect>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header user={user} />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </SyncProvider>
    </DatabaseProvider>
  )
}

export default AppShellClient
