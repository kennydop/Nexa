import { EmailNotConfirmedError, RepositoryError } from '../repository'
import { toAuthError } from './authErrors'

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
