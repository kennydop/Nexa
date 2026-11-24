import { defineConfig, devices } from '@playwright/test'

const PORT = 4174

// End-to-end tests always run against demo mode, in a separate build folder,
// so they never touch the real Supabase project in .env.local.
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${PORT}`, ...devices['Pixel 7'], channel: 'chromium' },
  webServer: {
    command: `pnpm exec vite build --outDir dist-e2e && pnpm exec vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_PUBLISHABLE_KEY: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_DEMO_MODERATOR_EMAILS: 'e2e.moderator@ucc.edu.gh',
    },
  },
})
