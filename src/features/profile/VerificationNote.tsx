import { Clock, Info, SealCheck } from '@phosphor-icons/react'
import type { UserRole } from '@/data/types'
import { STAFF_DOMAIN, STUDENT_DOMAIN } from '@/lib/institution'

interface Props {
  role: UserRole
  isVerified: boolean
}

/** Explains the account's verification state and how to change it. */
export function VerificationNote({ role, isVerified }: Props) {
  if (isVerified) {
    return (
      <p className="flex items-start gap-3 rounded-[20px] bg-success/12 p-4 text-sm font-semibold text-success">
        <SealCheck size={22} weight="fill" className="shrink-0" />
        Verified UCC {role === 'lecturer' ? 'lecturer' : 'student'}. Your posts show a verified badge.
      </p>
    )
  }
  if (role === 'lecturer') {
    return (
      <p className="flex items-start gap-3 rounded-[20px] bg-warning/12 p-4 text-sm font-semibold text-warning">
        <Clock size={22} className="shrink-0" />
        Waiting for a moderator to verify you as a lecturer. Signing up with your @{STAFF_DOMAIN} address verifies you
        straight away.
      </p>
    )
  }
  return (
    <p className="flex items-start gap-3 rounded-[20px] bg-surface-2 p-4 text-sm text-muted">
      <Info size={22} className="shrink-0 text-brand" />
      Studying or teaching at UCC? Accounts made with an @{STUDENT_DOMAIN} or @{STAFF_DOMAIN} address are verified
      automatically.
    </p>
  )
}
