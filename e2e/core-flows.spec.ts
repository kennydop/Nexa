import { expect, test } from '@playwright/test'

test('guest browses from college to a course', async ({ page }) => {
  await page.goto('/explore')
  await page.getByRole('link', { name: /College of Health and Allied Sciences/ }).click()
  await page.getByRole('link', { name: /BSc Nursing/ }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: /BSc Nursing/ })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Level\s*100/ })).toBeVisible()
})

test('search finds a course by code without spaces', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox', { name: /search courses/i }).fill('mat105')
  await page.getByRole('link', { name: /MAT 105/ }).click()
  await expect(page.getByRole('heading', { name: 'Engineering Mathematics I' })).toBeVisible()
})

test('posting requires sign-in, then the post appears', async ({ page }) => {
  await page.goto('/course/gen-103')
  await page.getByRole('button', { name: /How is this course/ }).click()
  await expect(page.getByRole('dialog')).toContainText('Join the conversation')
  await page.getByLabel('Full name').fill('Esi Test')
  await page.getByLabel('Email').fill('esi@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create my account' }).click()

  await page.getByRole('button', { name: /How is this course/ }).click()
  await page.getByRole('radio', { name: '4 stars' }).click()
  await page.getByLabel('Your post').fill('Statics problems every week kept me on track.')
  await page.getByRole('button', { name: 'Post', exact: true }).click()
  await expect(page.getByText('Statics problems every week kept me on track.')).toBeVisible()
})

test('home orbit shows the featured programme courses as moons', async ({ page }) => {
  await page.goto('/')
  const moons = page.getByRole('list', { name: 'Courses this semester' }).getByRole('link')
  await expect(moons.first()).toBeVisible()
})

test('a past question PDF opens in the in-app viewer', async ({ page }) => {
  await page.goto('/course/mat-105')
  await page.getByRole('tab', { name: /Past Qs/ }).click()
  await page.getByRole('region', { name: '2024' }).getByRole('button').first().click()
  const viewer = page.getByRole('dialog')
  await expect(viewer.getByRole('img', { name: 'Page 1' })).toBeVisible()
  await viewer.getByRole('button', { name: 'Close' }).click()
  await expect(viewer).toBeHidden()
})

test('a lecture video plays in the in-app viewer', async ({ page }) => {
  await page.goto('/course/gen-105')
  await page.getByRole('tab', { name: /Materials/i }).click()
  await page.getByRole('button', { name: /Ohm’s law in 60 seconds/ }).click()
  await expect(page.getByRole('dialog').locator('video')).toBeVisible()
})

test('a moderator verifies a pending lecturer', async ({ page }) => {
  await page.goto('/me')
  await page.getByRole('button', { name: /sign in/i }).first().click()
  await page.getByLabel('Full name').fill('Moderator Demo')
  await page.getByLabel('Email').fill('e2e.moderator@ucc.edu.gh')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create my account' }).click()

  await page.getByRole('link', { name: /Moderator portal/ }).click()
  const card = page.getByRole('listitem').filter({ hasText: 'Dr. Kwame Asante' })
  await card.getByRole('button', { name: 'Verify lecturer' }).click()
  await expect(page.getByText('Dr. Kwame Asante verified as lecturer')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Dr. Kwame Asante' })).toHaveCount(0)
})

test('a moderator creates a programme and adds its first course', async ({ page }) => {
  await page.goto('/me')
  await page.getByRole('button', { name: /sign in/i }).first().click()
  await page.getByLabel('Full name').fill('Moderator Demo')
  await page.getByLabel('Email').fill('e2e.moderator@ucc.edu.gh')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create my account' }).click()

  await page.goto('/moderate?tab=curriculum')
  await page.getByRole('button', { name: 'New programme' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByLabel('College').click()
  await page.getByRole('option').first().click()
  await sheet.getByLabel('Department').click()
  await page.getByRole('option').first().click()
  await sheet.getByLabel('Degree').fill('BSc')
  await sheet.getByLabel('Full name').fill('BSc Data Science')
  await sheet.getByRole('button', { name: 'Create programme' }).click()

  await expect(page.getByText('Created BSc Data Science')).toBeVisible()
  await page.getByLabel('Code').fill('dsc 101')
  await page.getByLabel('Title').fill('Foundations of Data Science')
  await page.getByRole('button', { name: 'Add course' }).click()
  await expect(page.getByText('Added DSC 101 to Level 100')).toBeVisible()

  await page.goto('/program/bsc-data-science')
  await expect(page.getByRole('heading', { level: 1, name: 'BSc Data Science' })).toBeVisible()
  await expect(page.getByText('Foundations of Data Science')).toBeVisible()
})

test('the app runs under the production security headers', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (m) => m.text().includes('Content Security Policy') && violations.push(m.text()))
  await page.goto('/course/mat-101')
  await expect(page.getByText(/sin 2x = cos x/).first()).toBeVisible()
  await page.goto('/course/mat-105')
  await page.getByRole('tab', { name: /Past Qs/ }).click()
  await page.getByRole('region', { name: '2024' }).getByRole('button').first().click()
  await expect(page.getByRole('dialog').getByRole('img', { name: 'Page 1' })).toBeVisible()
  expect(violations).toEqual([])
})

test('an expired confirmation link explains itself and opens sign-in', async ({ page }) => {
  await page.goto('/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')
  await expect(page.getByText(/expired or was already used/)).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Join the conversation')
  expect(new URL(page.url()).hash).toBe('')
})
