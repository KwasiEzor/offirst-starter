import { getPayloadUser } from '@/lib/auth'

import SyncStatusCard from './SyncStatusCard'
import UserGreeting from './UserGreeting'
import UserRoleCard from './UserRoleCard'

export default async function DashboardPage() {
  const user = await getPayloadUser()

  if (!user) {
    throw new Error('DashboardPage rendered without an authenticated user')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <UserGreeting user={user} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <SyncStatusCard />

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Local Storage
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            IndexedDB
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            WatermelonDB + LokiJS
          </p>
        </div>

        <UserRoleCard user={user} />
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Start
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This is an offline-first starter template. Here&apos;s what you can
          do:
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Work offline</strong> - Data is stored locally and synced
              when online
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Create posts</strong> - Manage content with rich text
              editing
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Organize with categories</strong> - Group your content
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Admin panel</strong> - Full CMS at /admin
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
