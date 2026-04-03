import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Home page should redirect unauthenticated users to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/login')

    // Check page has a title
    await expect(page).toHaveTitle(/offirst/i)
  })
})

test.describe('PWA', () => {
  test('has manifest.json', async ({ page }) => {
    const response = await page.request.get('/manifest.json')

    expect(response.ok()).toBe(true)

    const manifest = await response.json()
    expect(manifest.name).toBe('Offirst Starter')
    expect(manifest.short_name).toBe('Offirst')
    expect(manifest.icons).toHaveLength(2)
  })

  test('has PWA icons', async ({ page }) => {
    const icon192 = await page.request.get('/icons/icon-192.png')
    const icon512 = await page.request.get('/icons/icon-512.png')

    expect(icon192.ok()).toBe(true)
    expect(icon512.ok()).toBe(true)
  })
})
