'use client'

import { useCurrentUser } from '@/components/providers'

export default function UserRoleCard() {
  const user = useCurrentUser()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Your Role
      </h3>
      <p className="mt-2 text-3xl font-semibold capitalize text-gray-900 dark:text-white">
        {user.role}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {user.role === 'admin' ? 'Full access' : 'Standard access'}
      </p>
    </div>
  )
}
