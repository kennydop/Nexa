import { createClient } from '@supabase/supabase-js'
import type { AuthService } from './auth'
import { DemoAuth } from './demo/demoAuth'
import { DemoModeration } from './demo/demoModeration'
import { DemoRepository } from './demo/demoRepository'
import { DemoStore } from './demo/store'
import type { ModerationRepository, Repository } from './repository'
import { SupabaseAuth } from './supabase/supabaseAuth'
import { SupabaseModeration } from './supabase/supabaseModeration'
import { SupabaseRepository } from './supabase/supabaseRepository'

export interface Backend {
  repo: Repository
  auth: AuthService
  moderation: ModerationRepository
}

function createBackend(): Backend {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  // Supabase's newer "publishable" key; older projects call it the anon key.
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
    return { repo: new SupabaseRepository(db), auth: new SupabaseAuth(db), moderation: new SupabaseModeration(db) }
  }
  const store = new DemoStore()
  return { repo: new DemoRepository(store), auth: new DemoAuth(store), moderation: new DemoModeration(store) }
}

export const backend: Backend = createBackend()
