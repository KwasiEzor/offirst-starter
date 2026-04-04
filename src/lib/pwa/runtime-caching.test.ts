import { describe, expect, it } from 'vitest'

import {
  matchesRuntimeCachingRule,
  runtimeCaching,
} from './runtime-caching.mjs'

describe('runtimeCaching', () => {
  it('does not include a catch-all https caching rule', () => {
    expect(
      runtimeCaching.some(
        rule => String(rule.urlPattern) === '/^https:\\/\\/.*/i'
      )
    ).toBe(false)
  })

  it('matches the intended static asset URLs', () => {
    expect(
      matchesRuntimeCachingRule(
        'https://fonts.googleapis.com/css2?family=Roboto'
      )
    ).toBe(true)
    expect(matchesRuntimeCachingRule('https://example.com/logo.webp')).toBe(
      true
    )
    expect(
      matchesRuntimeCachingRule('https://example.com/_next/static/chunk.js')
    ).toBe(true)
  })

  it('does not cache app, auth, admin, or sync endpoints', () => {
    expect(matchesRuntimeCachingRule('https://example.com/dashboard')).toBe(
      false
    )
    expect(matchesRuntimeCachingRule('https://example.com/login')).toBe(false)
    expect(matchesRuntimeCachingRule('https://example.com/admin')).toBe(false)
    expect(matchesRuntimeCachingRule('https://example.com/api/users/me')).toBe(
      false
    )
    expect(matchesRuntimeCachingRule('https://example.com/api/sync/pull')).toBe(
      false
    )
  })
})
