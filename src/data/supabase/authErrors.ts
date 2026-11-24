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
const SEND_FAILED = 'We couldn’t send the email right now. Please try again in a few minutes.'

export function toAuthError(error: unknown, email: string): RepositoryError {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  if (code === 'email_not_confirmed') return new EmailNotConfirmedError(email, error)
  // Supabase reports a failed email delivery (e.g. SMTP rejected) as a 500 "Error sending … email".
  if (error instanceof Error && /error sending .*email/i.test(error.message)) return new RepositoryError(SEND_FAILED, error)
  return new RepositoryError(MESSAGES[code] ?? GENERIC, error)
}

/**
 * When a confirmation link fails, Supabase redirects back with the error in the
 * URL (hash or query). Returns a message to show, or null if there's no error.
 */
export function readAuthRedirectError(hash: string, search: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const query = new URLSearchParams(search)
  const code = params.get('error_code') ?? query.get('error_code')
  const error = params.get('error') ?? query.get('error')
  if (!code && !error) return null
  if (code === 'otp_expired') {
    return 'That confirmation link has expired or was already used. Sign in and press “Resend link” to get a new one.'
  }
  return 'We couldn’t confirm your email from that link. Sign in and press “Resend link” to try again.'
}
