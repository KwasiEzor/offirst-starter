/**
 * Server-side auth utilities
 * These functions use next/headers and can only be used in Server Components
 */
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from './payload'

// Re-export types for convenience
import type { AuthUser } from './auth-client'
export type { AuthUser }

/**
 * Get the current authenticated user from Payload
 * For use in Server Components and Server Actions
 *
 * @returns The authenticated user or null
 */
export async function getPayloadUser(): Promise<AuthUser | null> {
  try {
    const payload = await getPayloadClient()
    const headersList = await headers()

    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return null
    }

    // Type assertion through unknown for Payload's untyped user
    const typedUser = user as unknown as {
      id: string | number
      email: string
      role?: 'user' | 'admin'
      name?: string | null
    }

    return {
      id: String(typedUser.id),
      email: typedUser.email,
      role: typedUser.role || 'user',
      name: typedUser.name ?? null,
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * For use in Server Components
 *
 * @param redirectTo - Path to redirect to after login (default: current path)
 * @returns The authenticated user
 */
export async function requireAuth(redirectTo?: string): Promise<AuthUser> {
  const user = await getPayloadUser()

  if (!user) {
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login'
    redirect(loginUrl)
  }

  return user
}

/**
 * Require admin role - redirects to dashboard if not admin
 * For use in Server Components
 *
 * @returns The authenticated admin user
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}
