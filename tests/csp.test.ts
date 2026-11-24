import { createHash } from 'node:crypto'
import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

// The theme script in index.html runs before the app loads, so the production CSP
// allows it by hash. Editing that script without updating vercel.json would block it.
test('vercel.json CSP allows the inline theme script in index.html', () => {
  const html = readFileSync('index.html', 'utf8')
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    headers: { headers: { key: string; value: string }[] }[]
  }
  const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? ''
  expect(inline.length).toBeGreaterThan(0)
  for (const script of inline) {
    const hash = createHash('sha256').update(script).digest('base64')
    expect(csp).toContain(`'sha256-${hash}'`)
  }
})
