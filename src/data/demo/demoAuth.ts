import { institutionalRole } from '@/lib/institution'
import type { AuthService, SignUpInput } from '../auth'
import type { Person, Profile, UserRole } from '../types'
import { newId, type DemoStore } from './store'

/** Demo accounts whose email starts with this get moderator access. */
export const DEMO_MODERATOR_PREFIX = 'moderator@'

function buildProfile(email: string, fullName: string, claimedRole: UserRole, existing: Profile | null): Profile {
  // In demo mode the email is treated as already confirmed.
  const derived = institutionalRole(email)
  return {
    id: existing?.id ?? newId('user'),
    email,
    fullName,
    role: derived ?? claimedRole,
    isVerified: derived !== null,
    isModerator: email.toLowerCase().startsWith(DEMO_MODERATOR_PREFIX),
    programId: existing?.programId ?? null,
    level: existing?.level ?? null,
  }
}

function toPerson(profile: Profile): Person {
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email ?? '',
    role: profile.role,
    isVerified: profile.isVerified,
    verifiedVia: profile.isVerified ? 'email' : null,
    isModerator: profile.isModerator,
    emailConfirmed: true,
    createdAt: new Date().toISOString(),
  }
}

/** Local-only accounts for demo mode: no password is stored or checked. */
export class DemoAuth implements AuthService {
  private readonly listeners = new Set<(userId: string | null) => void>()
  private readonly store: DemoStore

  constructor(store: DemoStore) {
    this.store = store
  }

  private setProfile(profile: Profile) {
    this.store.update((s) => ({
      ...s,
      profile,
      people: [toPerson(profile), ...s.people.filter((p) => p.id !== profile.id)],
    }))
    this.listeners.forEach((listener) => listener(profile.id))
  }

  async currentUserId() {
    return this.store.state.profile?.id ?? null
  }

  onChange(listener: (userId: string | null) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async signIn(email: string) {
    const existing = this.store.state.profile
    const sameAccount = existing?.email?.toLowerCase() === email.toLowerCase() ? existing : null
    const name = sameAccount?.fullName ?? email.split('@')[0]
    this.setProfile(buildProfile(email, name, sameAccount?.role ?? 'visitor', sameAccount))
  }

  async signUp({ email, fullName, role }: SignUpInput) {
    this.setProfile(buildProfile(email, fullName, role, null))
    return { needsEmailConfirmation: false }
  }

  async signOut() {
    this.store.update((s) => ({ ...s, profile: null }))
    this.listeners.forEach((listener) => listener(null))
  }
}
