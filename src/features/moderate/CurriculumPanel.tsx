import { BookOpenText, CaretRight, Plus, PlusCircle, Trash } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { ConfirmSheet } from '@/components/ui/confirm-sheet'
import { EmptyState } from '@/components/ui/empty-state'
import { Field, Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { CurriculumEntry, Program } from '@/data/types'
import { ProgramPickerSheet } from '@/features/profile/ProgramPickerSheet'
import { useCurriculum } from '@/hooks/queries'
import { coursesFor } from '@/lib/academic'
import { normaliseCourseCode } from '@/lib/institution'
import { NewProgramSheet } from './NewProgramSheet'
import { useAddCurriculumCourse, useRemoveCurriculumCourse } from './queries'

const DEFAULT_LEVELS = [100, 200, 300, 400]

const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .transform(normaliseCourseCode)
    .pipe(z.string().regex(/^[A-Z]{2,5} \d{3}[A-Z]?$/, 'Use a code like CSC 101.')),
  title: z.string().trim().min(3, 'Give the course a title.').max(120),
  credits: z.union([z.literal(''), z.coerce.number().int().min(1).max(12)]),
})

type Errors = Partial<Record<'code' | 'title' | 'credits', string>>

function AddCourseForm({ programId, level, semester }: { programId: string; level: number; semester: 1 | 2 }) {
  const add = useAddCurriculumCourse()
  const [errors, setErrors] = useState<Errors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const parsed = courseSchema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
      setErrors(Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v?.[0]])) as Errors)
      return
    }
    setErrors({})
    const { code, title, credits } = parsed.data
    add.mutate(
      { programId, code, title, creditHours: credits === '' ? null : credits, level, semester },
      { onSuccess: () => form.reset() },
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 rounded-[22px] border border-dashed border-line-strong p-4">
      <p className="font-bold">Add a course to Level {level}, semester {semester}</p>
      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <Field label="Code" htmlFor="code" error={errors.code}>
          <Input id="code" name="code" placeholder="CSC 101" autoCapitalize="characters" aria-invalid={Boolean(errors.code)} />
        </Field>
        <Field label="Credits" htmlFor="credits" error={errors.credits}>
          <Input id="credits" name="credits" inputMode="numeric" placeholder="3" aria-invalid={Boolean(errors.credits)} />
        </Field>
      </div>
      <Field label="Title" htmlFor="title" error={errors.title}>
        <Input id="title" name="title" placeholder="Introduction to Programming" aria-invalid={Boolean(errors.title)} />
      </Field>
      <Button type="submit" disabled={add.isPending}>
        <Plus size={18} weight="bold" />
        {add.isPending ? 'Adding…' : 'Add course'}
      </Button>
    </form>
  )
}

export function CurriculumPanel() {
  const [program, setProgram] = useState<Program | null>(null)
  const [picking, setPicking] = useState(false)
  const [creating, setCreating] = useState(false)
  const [level, setLevel] = useState(100)
  const [semester, setSemester] = useState<1 | 2>(1)
  const [pendingRemove, setPendingRemove] = useState<CurriculumEntry | null>(null)
  const curriculum = useCurriculum(program?.id)
  const remove = useRemoveCurriculumCourse()
  const levels = program?.levels.length ? program.levels : DEFAULT_LEVELS
  const entries = coursesFor(curriculum.data ?? [], level, semester)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Add programmes that aren’t listed yet, and the courses students take in each, so materials and discussions have a home.
      </p>
      <button
        type="button"
        onClick={() => setPicking(true)}
        className="flex items-center gap-3 rounded-[22px] border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-line-strong"
      >
        <BookOpenText size={28} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-muted uppercase">Programme</span>
          <span className="block truncate font-bold">{program?.name ?? 'Choose a programme'}</span>
        </span>
        <CaretRight size={20} weight="bold" className="text-muted" />
      </button>
      <Button variant="secondary" onClick={() => setCreating(true)}>
        <PlusCircle size={20} />
        New programme
      </Button>

      {program && (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select
              value={String(level)}
              onChange={(value) => setLevel(Number(value))}
              options={levels.map((l) => ({ value: String(l), label: `Level ${l}` }))}
            />
            <Segmented
              label="Semester"
              className="w-40 whitespace-nowrap"
              value={String(semester) as '1' | '2'}
              onChange={(value) => setSemester(Number(value) as 1 | 2)}
              options={[
                { value: '1', label: 'Sem 1' },
                { value: '2', label: 'Sem 2' },
              ]}
            />
          </div>
          {curriculum.isPending ? (
            <Skeleton className="h-40 rounded-[22px]" />
          ) : entries.length === 0 ? (
            <EmptyState icon={BookOpenText} title="No courses yet" body="Add the first one below." />
          ) : (
            <ul className="divide-y divide-line rounded-[22px] border border-line bg-surface">
              {entries.map((entry) => (
                <li key={entry.course.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-brand">{entry.course.code}</span>
                    <span className="block truncate font-semibold">{entry.course.title}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger"
                    aria-label={`Remove ${entry.course.code}`}
                    onClick={() => setPendingRemove(entry)}
                  >
                    <Trash size={18} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <AddCourseForm key={`${program.id}-${level}-${semester}`} programId={program.id} level={level} semester={semester} />
        </>
      )}

      <ProgramPickerSheet
        title="Pick a programme"
        open={picking}
        onOpenChange={setPicking}
        onPick={(picked) => {
          setProgram(picked)
          setLevel(picked.levels[0] ?? 100)
          setPicking(false)
        }}
      />
      <NewProgramSheet
        open={creating}
        onOpenChange={setCreating}
        onCreated={(created) => {
          setProgram(created)
          setLevel(created.levels[0] ?? 100)
          setCreating(false)
        }}
      />
      <ConfirmSheet
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove from this programme?"
        body={pendingRemove ? `${pendingRemove.course.code} stays in the catalogue with its materials; it just won’t be listed under ${program?.name}.` : ''}
        confirmLabel="Remove"
        busy={remove.isPending}
        onConfirm={() => {
          if (!pendingRemove || !program) return
          remove.mutate(
            { programId: program.id, courseId: pendingRemove.course.id, code: pendingRemove.course.code },
            { onSettled: () => setPendingRemove(null) },
          )
        }}
      />
    </div>
  )
}
