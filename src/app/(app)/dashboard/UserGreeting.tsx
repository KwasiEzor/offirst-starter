import type { AuthUser } from '@/lib/auth'

interface UserGreetingProps {
  user: AuthUser
}

export default function UserGreeting({ user }: UserGreetingProps) {
  return (
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Welcome back, {user.name || user.email}!
    </p>
  )
}
