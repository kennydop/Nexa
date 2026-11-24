import { createContext, useContext } from 'react'
import type { Profile } from '@/data/types'

export interface AuthContextValue {
  userId: string | null
  profile: Profile | null
  isReady: boolean
  /** Opens the sign-in sheet; resolves nothing, callers re-check `userId`. */
  requestSignIn: (reason?: string) => void
  signInPrompt: { open: boolean; reason: string | null }
  closeSignIn: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
