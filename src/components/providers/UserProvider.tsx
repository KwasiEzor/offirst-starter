'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { AuthUser } from '@/lib/auth-client'

const UserContext = createContext<AuthUser | null>(null)

interface UserProviderProps {
  children: ReactNode
  user: AuthUser
}

export function UserProvider({ children, user }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useCurrentUser(): AuthUser {
  const user = useContext(UserContext)

  if (!user) {
    throw new Error('useCurrentUser must be used within UserProvider')
  }

  return user
}

export default UserProvider
