import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173', ...devices['Pixel 7'], channel: 'chromium' },
  webServer: { command: 'pnpm build && pnpm preview --port 4173 --strictPort', port: 4173, reuseExistingServer: true },
})
