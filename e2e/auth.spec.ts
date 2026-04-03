import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto('/dashboard')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows login form', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows register link on login page', async ({ page }) => {
    await page.goto('/login')

    // Check for register link
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible()
  })

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({
      timeout: 5000,
    })
  })
})

test.describe('Registration', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/register')

    // Check for registration form elements
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /create account|register|sign up/i })
    ).toBeVisible()
  })

  test('has link to login page', async ({ page }) => {
    await page.goto('/register')

    // Check for login link
    await expect(
      page.getByRole('link', { name: /sign in|login/i })
    ).toBeVisible()
  })
})
