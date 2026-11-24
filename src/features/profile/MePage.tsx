import { CaretRight, GraduationCap, Moon, SealCheck, ShieldCheck, SignOut, Stack } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Select } from '@/components/ui/select'
import { backend } from '@/data/backend'
import type { Program } from '@/data/types'
import { useAuth } from '@/features/auth/context'
import { InstallCard } from '@/features/install/InstallCard'
import { useProgram } from '@/hooks/queries'
import { useTheme, type ThemeChoice } from '@/hooks/useTheme'
import { levelLabel } from '@/lib/academic'
import { APP_NAME, UNIVERSITY } from '@/lib/brand'
import { errorMessage } from '@/lib/utils'
import { ProgramPickerSheet } from './ProgramPickerSheet'
import { VerificationNote } from './VerificationNote'

const ROLE_LABEL = { student: 'Student', lecturer: 'Lecturer', visitor: 'Visitor' } as const

export function MePage() {
  const { profile, userId, requestSignIn } = useAuth()
  const client = useQueryClient()
  const { choice, setChoice } = useTheme()
  const program = useProgram(profile?.programId)
  const [picking, setPicking] = useState(false)

  async function save(patch: { programId?: string; level?: number }) {
    try {
      await backend.repo.updateProfile(patch)
      await client.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Saved. Your Home orbit is updated.')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  function pick(next: Program) {
    setPicking(false)
    save({ programId: next.id, level: next.levels[0] })
  }

  async function signOut() {
    try {
      await backend.auth.signOut()
      toast.success('Signed out')
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="pt-safe flex flex-col gap-6 pt-4">
      <h1 className="text-[2rem] leading-tight font-extrabold">Me</h1>

      {profile ? (
        <section className="flex items-center gap-4 rounded-[28px] border border-line bg-surface p-4 shadow-card">
          <Avatar name={profile.fullName} className="size-16 text-lg" />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">{profile.fullName}</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              {ROLE_LABEL[profile.role]}
              {profile.isVerified && <SealCheck size={16} weight="fill" className="text-success" aria-label="Verified" />}
            </p>
            {profile.email && <p className="truncate text-xs text-faint">{profile.email}</p>}
          </div>
        </section>
      ) : (
        <section className="rounded-[28px] bg-plum p-5 text-[#f7eee6]">
          <h2 className="text-xl font-bold">You’re browsing as a guest</h2>
          <p className="mt-1 text-sm text-[#f7eee6]/75">
            Every programme, course and file is open to everyone. Sign in to post, rate, save and upload.
          </p>
          <Button className="mt-4" onClick={() => requestSignIn()}>
            Sign in or create account
          </Button>
        </section>
      )}

      {profile && <VerificationNote role={profile.role} isVerified={profile.isVerified} />}

      {profile?.isModerator && (
        <Link
          to="/moderate"
          className="flex items-center gap-4 rounded-[24px] bg-navy p-4 text-[#f7eee6] transition-transform duration-150 active:scale-[0.98]"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10">
            <ShieldCheck size={28} />
          </span>
          <span className="flex-1">
            <span className="block font-bold">Moderator portal</span>
            <span className="block text-sm text-[#f7eee6]/70">Verify people, review content, add courses</span>
          </span>
          <CaretRight size={18} weight="bold" />
        </Link>
      )}

      {userId && profile && (
        <section aria-labelledby="study-heading" className="flex flex-col gap-3">
          <h2 id="study-heading" className="text-sm font-bold tracking-wider text-faint uppercase">
            My studies
          </h2>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="flex items-center gap-3 rounded-[22px] border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong"
          >
            <GraduationCap size={28} className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">Programme</span>
              <span className="block truncate font-bold">{program.data?.name ?? 'Choose your programme'}</span>
            </span>
            <CaretRight size={18} weight="bold" className="text-faint" />
          </button>
          {program.data && (
            <div className="flex items-center gap-3 rounded-[22px] border border-line bg-surface p-4">
              <Stack size={28} className="shrink-0 text-brand" />
              <span className="flex-1 text-sm text-muted">Level</span>
              <Select
                value={String(profile.level ?? program.data.levels[0])}
                onChange={(v) => save({ level: Number(v) })}
                options={program.data.levels.map((l) => ({ value: String(l), label: levelLabel(l) }))}
                className="h-10 w-40"
              />
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="look-heading" className="flex flex-col gap-3">
        <h2 id="look-heading" className="flex items-center gap-2 text-sm font-bold tracking-wider text-faint uppercase">
          <Moon size={16} /> Appearance
        </h2>
        <Segmented<ThemeChoice>
          label="Theme"
          value={choice}
          onChange={setChoice}
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </section>

      <InstallCard />

      {userId && (
        <Button variant="outline" onClick={signOut} className="self-start">
          <SignOut size={18} />
          Sign out
        </Button>
      )}

      <p className="text-center text-xs text-faint">
        {APP_NAME} · an open learning hub for the {UNIVERSITY}
      </p>

      <ProgramPickerSheet open={picking} onOpenChange={setPicking} onPick={pick} />
    </div>
  )
}
