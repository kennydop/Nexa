// Captures key screens at phone size in light and dark themes.
//   node scripts/screens.mjs <outDir> [baseUrl]
import { chromium, devices } from '@playwright/test'

const [outDir = 'screens', base = 'http://localhost:4173'] = process.argv.slice(2)
const ROUTES = [
  ['home', '/'],
  ['explore', '/explore'],
  ['college', '/college/chls'],
  ['program', '/program/bsc-computer-engineering?level=200&sem=1'],
  ['course', '/course/mat-105'],
  ['search', '/search?q=account'],
  ['me', '/me'],
]

const browser = await chromium.launch({ channel: 'chromium' })
for (const scheme of ['dark', 'light']) {
  const context = await browser.newContext({ ...devices['iPhone 14'], colorScheme: scheme })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const [name, path] of ROUTES) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${outDir}/${scheme}-${name}.png` })
  }
  if (errors.length) console.log(scheme, 'errors:', errors)
  await context.close()
}
await browser.close()
console.log('done')
