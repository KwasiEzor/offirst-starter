import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Layout for authentication pages (login, register)
 * Centered card layout with no navigation
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Offirst
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Offline-first starter template
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
