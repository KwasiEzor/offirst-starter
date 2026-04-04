import type { ReactNode } from 'react'

import AppShellClient from './AppShellClient'
import type { AuthUser } from '@/lib/auth-client'

interface AppShellProps {
  children: ReactNode
  user: AuthUser
}

/**
 * Server component wrapper around the authenticated app shell.
 * Only the provider-driven shell chrome stays on the client.
 */
export function AppShell({ children, user }: AppShellProps) {
  return <AppShellClient user={user}>{children}</AppShellClient>
}

export default AppShell
