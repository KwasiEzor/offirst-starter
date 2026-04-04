import type { ReactNode } from 'react'

import { requireAuth } from '@/lib/auth'
import { AppShell } from '@/components/layout'

export const dynamic = 'force-dynamic'

interface AppLayoutProps {
  children: ReactNode
}

/**
 * Layout for authenticated app pages
 * Requires authentication - redirects to login if not authenticated
 */
export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireAuth()

  return <AppShell user={user}>{children}</AppShell>
}
