'use client'

import { useCurrentUser } from '@/components/providers'

export default function UserGreeting() {
  const user = useCurrentUser()

  return (
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Welcome back, {user.name || user.email}!
    </p>
  )
}
