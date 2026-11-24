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
