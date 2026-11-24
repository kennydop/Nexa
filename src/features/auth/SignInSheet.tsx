import { ChalkboardTeacher, SealCheck, Student, UsersThree, type Icon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Sheet } from '@/components/ui/sheet'
import { backend } from '@/data/backend'
import type { UserRole } from '@/data/types'
import { institutionalRole, STAFF_DOMAIN, STUDENT_DOMAIN } from '@/lib/institution'
import { cn, errorMessage } from '@/lib/utils'
import { useAuth } from './context'

type Mode = 'signin' | 'signup'

const CLAIMS: { value: UserRole; label: string; blurb: string; icon: Icon }[] = [
  { value: 'visitor', label: 'Visitor', blurb: 'Learning from outside UCC', icon: UsersThree },
  { value: 'lecturer', label: 'UCC lecturer', blurb: 'A moderator will verify you', icon: ChalkboardTeacher },
  { value: 'student', label: 'UCC student', blurb: 'Use your stu email for a badge', icon: Student },
]

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Passwords are at least 8 characters.'),
})
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, 'Tell us your name.').max(80),
})

type Errors = Partial<Record<'email' | 'password' | 'fullName', string>>

function InstitutionNotice({ role }: { role: 'student' | 'lecturer' }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-success/12 px-3 py-2.5 text-sm font-semibold text-success">
      <SealCheck size={20} weight="fill" className="mt-px shrink-0" />
      {role === 'student'
        ? 'UCC student email: you’ll be verified once you confirm it.'
        : 'UCC staff email: you’ll be verified as a lecturer once you confirm it.'}
    </p>
  )
}

export function SignInSheet() {
  const { signInPrompt, closeSignIn } = useAuth()
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [claim, setClaim] = useState<UserRole>('visitor')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const detected = institutionalRole(email)
  const showClaims = mode === 'signup' && email.includes('@') && detected === null

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const parsed = (mode === 'signup' ? signUpSchema : signInSchema).safeParse(form)
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])) as Errors)
      return
    }
    setErrors({})
    setBusy(true)
    try {
      if (mode === 'signin') {
        await backend.auth.signIn(parsed.data.email, parsed.data.password)
        toast.success('Welcome back!')
      } else {
        const data = parsed.data as z.infer<typeof signUpSchema>
        const role = institutionalRole(data.email) ?? claim
        const { needsEmailConfirmation } = await backend.auth.signUp({ ...data, role })
        toast.success(
          needsEmailConfirmation ? 'Check your inbox to confirm your email.' : `Welcome, ${data.fullName.split(' ')[0]}!`,
        )
      }
      closeSignIn()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={signInPrompt.open}
      onOpenChange={(open) => !open && closeSignIn()}
      title={mode === 'signup' ? 'Join the conversation' : 'Welcome back'}
      description={signInPrompt.reason ?? 'Browsing is free for everyone. An account lets you post, rate, save and upload.'}
    >
      <Segmented
        label="Account"
        value={mode}
        onChange={(next) => {
          setMode(next)
          setErrors({})
        }}
        options={[
          { value: 'signup', label: 'Create account' },
          { value: 'signin', label: 'Sign in' },
        ]}
        className="mb-5"
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 pb-4">
        {mode === 'signup' && (
          <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
            <Input id="fullName" name="fullName" autoComplete="name" aria-invalid={Boolean(errors.fullName)} />
          </Field>
        )}
        <Field
          label="Email"
          htmlFor="email"
          error={errors.email}
          hint={mode === 'signup' && !detected ? `UCC students and staff: use your @${STUDENT_DOMAIN} or @${STAFF_DOMAIN} address to get verified automatically.` : undefined}
        >
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
        {mode === 'signup' && detected && <InstitutionNotice role={detected} />}
        {showClaims && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-muted">I am a…</legend>
            <div className="grid grid-cols-3 gap-2">
              {CLAIMS.map(({ value, label, blurb, icon: IconCmp }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={claim === value}
                  onClick={() => setClaim(value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-[18px] border p-3 text-left transition-[border-color,background-color] duration-150',
                    claim === value ? 'border-brand bg-brand-soft' : 'border-line bg-surface-2 hover:border-line-strong',
                  )}
                >
                  <IconCmp size={26} className={claim === value ? 'text-brand' : 'text-muted'} />
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="block text-[0.7rem] leading-tight text-muted">{blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>
        <Button type="submit" size="lg" block disabled={busy} className="mt-2">
          {busy ? 'One moment…' : mode === 'signup' ? 'Create my account' : 'Sign in'}
        </Button>
      </form>
    </Sheet>
  )
}
