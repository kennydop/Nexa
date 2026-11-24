import { BookOpenText, CheckCircle, PushPin } from '@phosphor-icons/react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { CourseRow } from '@/components/CourseRow'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import { backend } from '@/data/backend'
import { useAuth } from '@/features/auth/context'
import { useColleges, useCurriculum, useProgram } from '@/hooks/queries'
import { coursesFor, currentSemester, MOON_BG, totalCredits } from '@/lib/academic'
import { cn, errorMessage } from '@/lib/utils'

export function ProgramPage() {
  const { programId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { profile, userId, requestSignIn } = useAuth()
  const client = useQueryClient()
  const program = useProgram(programId)
  const curriculum = useCurriculum(programId)
  const college = useColleges().data?.find((c) => c.id === program.data?.collegeId)

  const levels = program.data?.levels ?? []
  const level = Number(params.get('level')) || profile?.level || levels[0] || 100
  const semester = (Number(params.get('sem')) || currentSemester()) as 1 | 2
  const entries = coursesFor(curriculum.data ?? [], level, semester)
  const isMine = profile?.programId === programId
  const accent = college ? MOON_BG[college.color] : 'bg-brand'

  const setQuery = (patch: Record<string, string>) =>
    setParams((prev) => ({ ...Object.fromEntries(prev), ...patch }), { replace: true })

  async function makeMine() {
    if (!userId) {
      requestSignIn('Sign in to pin a programme to your Home orbit.')
      return
    }
    try {
      await backend.repo.updateProfile({ programId, level })
      await client.invalidateQueries({ queryKey: ['profile'] })
      toast.success(`Pinned to Home: Level ${level}`)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  if (program.isPending) {
    return (
      <div className="pt-safe flex flex-col gap-4 pt-16">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (!program.data) {
    return (
      <>
        <PageHeader />
        <EmptyState icon={BookOpenText} title="Programme not found" body="It may have been renamed or removed." />
      </>
    )
  }

  return (
    <div>
      <PageHeader title={program.data.degree} />
      <header className="mb-6">
        <p className="text-sm font-bold text-muted">{college?.name}</p>
        <h1 className="mt-1 text-[1.9rem] leading-[1.1] font-extrabold">{program.data.name}</h1>
        <Button
          variant={isMine ? 'secondary' : 'outline'}
          size="sm"
          className="mt-4"
          onClick={makeMine}
          disabled={isMine && profile?.level === level}
        >
          {isMine && profile?.level === level ? (
            <CheckCircle size={18} weight="fill" className="text-success" />
          ) : (
            <PushPin size={18} />
          )}
          {isMine && profile?.level === level ? 'Pinned to Home' : `Pin Level ${level} to Home`}
        </Button>
      </header>

      {/* Level picker */}
      <div role="tablist" aria-label="Level" className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={l === level}
            onClick={() => setQuery({ level: String(l) })}
            className={cn(
              'flex h-16 min-w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-[20px] border font-display transition-[background-color,border-color,color] duration-150',
              l === level ? cn(accent, 'border-transparent text-[#1a0e16]') : 'border-line bg-surface text-muted hover:text-text',
            )}
          >
            <span className="text-[0.65rem] font-bold tracking-wider uppercase opacity-70">Level</span>
            <span className="text-xl leading-none font-extrabold">{l}</span>
          </button>
        ))}
      </div>

      <Segmented
        label="Semester"
        value={String(semester) as '1' | '2'}
        onChange={(s) => setQuery({ sem: s })}
        options={[
          { value: '1', label: 'First semester' },
          { value: '2', label: 'Second semester' },
        ]}
        className="mb-5"
      />

      {curriculum.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[4.5rem]" />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <>
          <p className="mb-1 text-sm font-semibold text-muted">
            {entries.length} courses · {totalCredits(entries)} credit hours
          </p>
          <ul className="-mx-2">
            {entries.map(({ course }) => (
              <li key={course.id}>
                <CourseRow course={course} accent={accent} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon={BookOpenText}
          title="Course list not published yet"
          body={`UCC hasn’t published the Level ${level}, semester ${semester} course list for this programme. Courses will appear here once they’re added.`}
        />
      )}
    </div>
  )
}
