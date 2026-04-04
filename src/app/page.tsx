import { redirect } from 'next/navigation'

import { getPayloadUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Home page - redirects to dashboard if authenticated, login if not
 */
export default async function HomePage() {
  const user = await getPayloadUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
