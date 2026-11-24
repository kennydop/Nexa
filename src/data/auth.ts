import type { UserRole } from './types'

export interface SignUpInput {
  email: string
  password: string
  fullName: string
  role: UserRole
}

export interface AuthService {
  currentUserId(): Promise<string | null>
  /** Returns an unsubscribe function. */
  onChange(listener: (userId: string | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signUp(input: SignUpInput): Promise<{ needsEmailConfirmation: boolean }>
  signOut(): Promise<void>
  /** Sends the sign-up confirmation link again. */
  resendConfirmation(email: string): Promise<void>
}
