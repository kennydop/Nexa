import { EnvelopeSimpleOpen } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { backend } from '@/data/backend'
import { errorMessage } from '@/lib/utils'

const RESEND_COOLDOWN_SECONDS = 60

interface Props {
  email: string
  onBack: () => void
}

/** Shown after sign-up, or when signing in before the email is confirmed. */
export function CheckInbox({ email, onBack }: Props) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function resend() {
    setBusy(true)
    try {
      await backend.auth.resendConfirmation(email)
      toast.success('Sent. Check your inbox.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center pb-6 text-center" role="status">
      <div className="mb-4 grid size-16 place-items-center rounded-[22px] bg-brand-soft text-brand">
        <EnvelopeSimpleOpen size={34} />
      </div>
      <h3 className="text-xl font-bold">Confirm your email</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">
        We sent a link to <strong className="break-all text-text">{email}</strong>. Open it to finish setting up your account.
        If it isn’t there, check your spam or junk folder.
      </p>
      <div className="mt-6 flex w-full flex-col gap-2">
        <Button size="lg" block variant="secondary" disabled={busy || cooldown > 0} onClick={resend}>
          {cooldown > 0 ? `Resend link in ${cooldown}s` : busy ? 'Sending…' : 'Resend link'}
        </Button>
        <Button size="lg" block variant="ghost" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    </div>
  )
}
