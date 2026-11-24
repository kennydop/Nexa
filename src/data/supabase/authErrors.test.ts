import { EmailNotConfirmedError, RepositoryError } from '../repository'
import { readAuthRedirectError, toAuthError } from './authErrors'

const supabaseError = (code: string, message = 'raw') => Object.assign(new Error(message), { code, status: 400 })

describe('toAuthError', () => {
  it('flags unconfirmed emails so the app can offer to resend the link', () => {
    const error = toAuthError(supabaseError('email_not_confirmed'), 'kofi@stu.ucc.edu.gh')
    expect(error).toBeInstanceOf(EmailNotConfirmedError)
    expect((error as EmailNotConfirmedError).email).toBe('kofi@stu.ucc.edu.gh')
  })

  it('keeps the generic message for wrong credentials', () => {
    expect(toAuthError(supabaseError('invalid_credentials'), 'a@b.com').message).toBe('Email or password is incorrect.')
  })

  it('explains rate limits and existing accounts in plain words', () => {
    expect(toAuthError(supabaseError('over_email_send_rate_limit'), 'a@b.com').message).toMatch(/too many emails/i)
    expect(toAuthError(supabaseError('user_already_exists'), 'a@b.com').message).toMatch(/already has an account/i)
  })

  it('falls back to a safe message for unknown errors', () => {
    const error = toAuthError(supabaseError('something_new', 'internal detail'), 'a@b.com')
    expect(error).toBeInstanceOf(RepositoryError)
    expect(error.message).toBe('Something went wrong. Please try again.')
  })
})

describe('toAuthError when the email service fails', () => {
  it('says the email could not be sent instead of a generic error', () => {
    const smtpFailure = Object.assign(new Error('Error sending confirmation email'), { code: 'unexpected_failure', status: 500 })
    expect(toAuthError(smtpFailure, 'a@b.com').message).toMatch(/couldn’t send the email/i)
  })
})

describe('readAuthRedirectError', () => {
  it('explains expired or reused confirmation links', () => {
    const hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'
    expect(readAuthRedirectError(hash, '')).toMatch(/expired or was already used/i)
  })

  it('reads errors from the query string too', () => {
    expect(readAuthRedirectError('', '?error=server_error&error_description=Something')).toMatch(/couldn’t confirm/i)
  })

  it('returns null for normal pages and successful sign-in redirects', () => {
    expect(readAuthRedirectError('', '')).toBeNull()
    expect(readAuthRedirectError('#access_token=abc&type=signup', '')).toBeNull()
  })
})
