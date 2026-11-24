import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Select } from '@/components/ui/select'
import { Sheet } from '@/components/ui/sheet'
import type { AwardLevel, Program } from '@/data/types'
import { useColleges, useDepartments } from '@/hooks/queries'
import { ALL_LEVELS, defaultLevels } from '@/lib/institution'
import { cn } from '@/lib/utils'
import { useAddProgram } from './queries'

const AWARDS: { value: AwardLevel; label: string }[] = [
  { value: 'undergraduate', label: 'Degree' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'postgraduate', label: 'Postgrad' },
]

const schema = z.object({
  collegeId: z.string().min(1, 'Choose a college.'),
  departmentId: z.string().min(1, 'Choose a department.'),
  degree: z.string().trim().min(2, 'For example BSc, BA, MPhil.').max(20),
  name: z.string().trim().min(5, 'Give the full name, e.g. BSc Data Science.').max(140),
  levels: z.array(z.number()).min(1, 'Pick at least one level.'),
})

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (program: Program) => void
}

export function NewProgramSheet({ open, onOpenChange, onCreated }: Props) {
  const colleges = useColleges()
  const [collegeId, setCollegeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [award, setAward] = useState<AwardLevel>('undergraduate')
  const [levels, setLevels] = useState<number[]>(defaultLevels('undergraduate'))
  const [errors, setErrors] = useState<Errors>({})
  const departments = useDepartments(collegeId)
  const add = useAddProgram()

  const toggleLevel = (level: number) =>
    setLevels((current) => (current.includes(level) ? current.filter((l) => l !== level) : [...current, level].sort((a, b) => a - b)))

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const parsed = schema.safeParse({ ...form, collegeId, departmentId, levels })
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
      setErrors(Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v?.[0]])) as Errors)
      return
    }
    setErrors({})
    add.mutate({ ...parsed.data, awardLevel: award }, { onSuccess: (program) => onCreated(program) })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New programme" description="Add a programme that isn’t in the catalogue yet. You can add its courses next.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 pb-4">
        <Field label="College" htmlFor="college" error={errors.collegeId}>
          <Select
            id="college"
            value={collegeId}
            onChange={(value) => {
              setCollegeId(value)
              setDepartmentId('')
            }}
            placeholder="Choose a college"
            options={(colleges.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
          />
        </Field>
        <Field label="Department" htmlFor="department" error={errors.departmentId}>
          <Select
            id="department"
            value={departmentId}
            onChange={setDepartmentId}
            placeholder={collegeId ? 'Choose a department' : 'Choose a college first'}
            options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
          />
        </Field>
        <Segmented
          label="Award"
          value={award}
          onChange={(next) => {
            setAward(next)
            setLevels(defaultLevels(next))
          }}
          options={AWARDS}
        />
        <div className="grid grid-cols-[6rem_1fr] gap-3">
          <Field label="Degree" htmlFor="degree" error={errors.degree}>
            <Input id="degree" name="degree" placeholder="BSc" aria-invalid={Boolean(errors.degree)} />
          </Field>
          <Field label="Full name" htmlFor="program-name" error={errors.name}>
            <Input id="program-name" name="name" placeholder="BSc Data Science" aria-invalid={Boolean(errors.name)} />
          </Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-muted">Levels</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={levels.includes(level)}
                onClick={() => toggleLevel(level)}
                className={cn(
                  'h-10 rounded-full border px-4 text-sm font-bold transition-colors duration-150',
                  levels.includes(level) ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface-2 text-muted hover:border-line-strong',
                )}
              >
                {level}
              </button>
            ))}
          </div>
          {errors.levels && <p className="mt-2 text-sm text-danger">{errors.levels}</p>}
        </fieldset>
        <Button type="submit" size="lg" block disabled={add.isPending} className="mt-2">
          {add.isPending ? 'Creating…' : 'Create programme'}
        </Button>
      </form>
    </Sheet>
  )
}
