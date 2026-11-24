import { EmailNotConfirmedError, RepositoryError } from '../repository'

/** Supabase Auth error codes we explain to people; anything else gets a safe generic message. */
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  user_already_exists: 'That email already has an account. Sign in instead.',
  email_exists: 'That email already has an account. Sign in instead.',
  weak_password: 'Choose a stronger password (at least 8 characters).',
  email_address_invalid: 'That email address doesn’t look right.',
  over_email_send_rate_limit: 'We’ve sent too many emails to this address. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a minute and try again.',
  signup_disabled: 'New sign-ups are paused right now.',
}

const GENERIC = 'Something went wrong. Please try again.'

export function toAuthError(error: unknown, email: string): RepositoryError {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  if (code === 'email_not_confirmed') return new EmailNotConfirmedError(email, error)
  return new RepositoryError(MESSAGES[code] ?? GENERIC, error)
}
