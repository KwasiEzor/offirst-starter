/**
 * Client-side auth utilities
 * These functions use fetch and can be used in client components
 */

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
  name?: string | null
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
