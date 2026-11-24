import { expect, test } from '@playwright/test'

test('plans open from Me and the billing toggle changes prices', async ({ page }) => {
  await page.goto('/me')
  await page.getByRole('link', { name: /Your plan/ }).click()
  await expect(page).toHaveURL(/\/plans$/)

  const pro = page.getByRole('article', { name: 'Pro' })
  await expect(pro).toContainText('GH₵45')
  await page.getByRole('radio', { name: 'Monthly' }).click()
  await expect(page).toHaveURL(/billing=monthly/)
  await expect(pro).toContainText('GH₵15')

  await pro.getByRole('button', { name: 'Get Pro' }).click()
  await expect(page.getByRole('dialog')).toContainText('not taking payments yet')
})

test('the study assistant preview opens inside the file viewer', async ({ page }) => {
  await page.goto('/course/mat-105')
  await page.getByRole('tab', { name: /Past Qs/ }).click()
  await page.getByRole('region', { name: '2024' }).getByRole('button').first().click()
  await page.getByRole('button', { name: 'Study assistant' }).click()
  await expect(page.getByRole('region', { name: /Study assistant/ })).toContainText('Premium · coming soon')
  await page.getByRole('link', { name: 'See Premium' }).click()
  await expect(page).toHaveURL(/\/plans$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

async function signUp(page: import('@playwright/test').Page) {
  await page.goto('/me')
  await page.getByRole('button', { name: 'Sign in or create account' }).click()
  await page.getByLabel('Full name').fill('Kofi Nudge')
  await page.getByLabel('Email').fill('kofi.nudge@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create my account' }).click()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
}

test('guests are not nudged to upgrade, signed-in users are, and Not now sticks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('complementary', { name: 'Pro suggestion' })).toHaveCount(0)

  await signUp(page)
  await page.goto('/')
  const nudge = page.getByRole('complementary', { name: 'Pro suggestion' })
  await expect(nudge).toContainText('Exams coming up?')
  await nudge.getByRole('button', { name: 'Not now' }).click()
  await expect(nudge).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: /Semester/ })).toBeVisible()
  await expect(nudge).toHaveCount(0)
})

test('opening a third file in a day suggests the study assistant once', async ({ page }) => {
  await signUp(page)
  await page.goto('/course/mat-105')
  await page.getByRole('tab', { name: /Past Qs/ }).click()
  const papers = page.getByRole('region', { name: '2024' }).getByRole('button')
  const viewer = page.getByRole('dialog')
  const callout = viewer.getByRole('complementary', { name: 'Premium suggestion' })

  for (let i = 0; i < 2; i++) {
    await papers.first().click()
    await expect(viewer.getByRole('img', { name: 'Page 1' })).toBeVisible()
    await expect(callout).toHaveCount(0)
    await viewer.getByRole('button', { name: 'Close', exact: true }).click()
  }
  await papers.first().click()
  await expect(callout).toContainText('Studying hard today?')
  await callout.getByRole('button', { name: 'Show me' }).click()
  await expect(viewer.getByRole('region', { name: /Study assistant/ })).toBeVisible()
  await viewer.getByRole('button', { name: 'Close', exact: true }).click()

  await papers.first().click()
  await expect(viewer.getByRole('img', { name: 'Page 1' })).toBeVisible()
  await expect(callout).toHaveCount(0)
})
