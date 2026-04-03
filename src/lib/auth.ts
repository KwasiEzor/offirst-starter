import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from './payload'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
  name?: string | null
}

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

/**
 * Check if user is authenticated (client-side helper)
 * Uses a fetch to /api/users/me endpoint
 */
export async function checkAuth(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch {
    return null
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Login failed',
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  await fetch('/api/users/logout', {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: data.errors?.[0]?.message || 'Registration failed',
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}
