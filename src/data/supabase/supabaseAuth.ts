import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthService, SignUpInput } from '../auth'
import { RepositoryError } from '../repository'
import { toAuthError } from './authErrors'

export class SupabaseAuth implements AuthService {
  private readonly db: SupabaseClient

  constructor(db: SupabaseClient) {
    this.db = db
  }

  async currentUserId() {
    const { data } = await this.db.auth.getSession()
    return data.session?.user.id ?? null
  }

  onChange(listener: (userId: string | null) => void) {
    const { data } = this.db.auth.onAuthStateChange((_event, session) => listener(session?.user.id ?? null))
    return () => data.subscription.unsubscribe()
  }

  async signIn(email: string, password: string) {
    const { error } = await this.db.auth.signInWithPassword({ email, password })
    if (error) throw toAuthError(error, email)
  }

  async signUp({ email, password, fullName, role }: SignUpInput) {
    const { data, error } = await this.db.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role }, emailRedirectTo: window.location.origin },
    })
    if (error) throw toAuthError(error, email)
    return { needsEmailConfirmation: data.session === null }
  }

  async resendConfirmation(email: string) {
    const { error } = await this.db.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } })
    if (error) throw toAuthError(error, email)
  }

  async signOut() {
    const { error } = await this.db.auth.signOut()
    if (error) throw new RepositoryError('Could not sign out.', error)
  }
}
