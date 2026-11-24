import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { CourseOrbit } from '@/components/orbit/CourseOrbit'
import { CourseRow } from '@/components/CourseRow'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { FEATURED_PROGRAM_ID } from '@/data/featured'
import { useAuth } from '@/features/auth/context'
import { InstallCard } from '@/features/install/InstallCard'
import { useCurriculum, useProgram } from '@/hooks/queries'
import { coursesFor, currentSemester, totalCredits } from '@/lib/academic'
import { APP_NAME } from '@/lib/brand'
import { CollegeStrip } from './CollegeStrip'

const MOON_ACCENTS = ['bg-ember', 'bg-sky', 'bg-lime', 'bg-violet', 'bg-gold', 'bg-mint', 'bg-rose']

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { profile, requestSignIn } = useAuth()
  const programId = profile?.programId ?? FEATURED_PROGRAM_ID
  const isPersonal = Boolean(profile?.programId)
  const program = useProgram(programId)
  const curriculum = useCurriculum(programId)
  const [semester, setSemester] = useState<1 | 2>(currentSemester)
  const [greetingText] = useState(() => greeting(new Date().getHours()))

  const level = profile?.level ?? program.data?.levels[0] ?? 100
  const entries = coursesFor(curriculum.data ?? [], level, semester)
  const firstName = profile?.fullName.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      <header className="pt-safe flex items-center justify-between pt-3">
        <div>
          <p className="text-sm font-semibold text-muted">{greetingText}</p>
          <h1 className="text-[1.75rem] leading-tight font-extrabold">{firstName ? `Akwaaba, ${firstName}` : APP_NAME}</h1>
        </div>
        {profile ? (
          <Link to="/me" aria-label="Your profile">
            <Avatar name={profile.fullName} className="size-11" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => requestSignIn()}
            className="rounded-full border border-line-strong px-4 py-2 text-sm font-bold transition-colors hover:bg-surface-2"
          >
            Sign in
          </button>
        )}
      </header>

      {/* Orbit hero */}
      <section
        aria-labelledby="orbit-heading"
        className="grain relative -mx-1 overflow-hidden rounded-[32px] border border-line bg-surface px-4 pt-5 pb-4 shadow-card"
      >
        <div className="flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand uppercase">
              <Sparkle size={14} weight="fill" />
              {isPersonal ? 'Your orbit' : 'Featured programme'}
            </p>
            <h2 id="orbit-heading" className="mt-1 line-clamp-2 text-xl leading-tight font-bold">
              {program.data?.name ?? <Skeleton className="h-6 w-40" />}
            </h2>
          </div>
          <div className="shrink-0 rounded-2xl bg-surface-2 px-3 py-2 text-right">
            <p className="font-display text-xl leading-none font-extrabold">{totalCredits(entries)}</p>
            <p className="text-[0.65rem] font-bold text-muted uppercase">credits</p>
          </div>
        </div>

        {curriculum.isPending ? (
          <Skeleton className="mx-auto my-6 aspect-square w-4/5 rounded-full" />
        ) : (
          <div className="py-4">
            <CourseOrbit
              courses={entries.map((e) => e.course)}
              sunLabel={`L${level}`}
              sunCaption={`Sem ${semester} · tap`}
              sunHint={`Showing semester ${semester}. Tap to switch to semester ${semester === 1 ? 2 : 1}.`}
              onSunPress={() => setSemester((s) => (s === 1 ? 2 : 1))}
            />
          </div>
        )}

        {!isPersonal && (
          <Link
            to={profile ? '/me' : '/explore'}
            className="flex items-center justify-between rounded-[20px] bg-brand-soft px-4 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/20"
          >
            {profile ? 'Set your programme to make this orbit yours' : 'Find your programme'}
            <ArrowRight size={18} weight="bold" />
          </Link>
        )}
      </section>

      {entries.length > 0 && (
        <section aria-labelledby="sem-heading">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="sem-heading" className="text-xl font-bold">
              Semester {semester}
            </h2>
            <Link to={`/program/${programId}`} className="text-sm font-bold text-brand">
              All levels
            </Link>
          </div>
          <ul className="-mx-2">
            {entries.map((entry, i) => (
              <li key={entry.course.id}>
                <CourseRow course={entry.course} accent={MOON_ACCENTS[i % MOON_ACCENTS.length]} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <CollegeStrip />
      <InstallCard />
    </div>
  )
}
