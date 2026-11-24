import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgramRow } from '@/components/ProgramRow'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import type { AwardLevel } from '@/data/types'
import { useColleges, useDepartments, usePrograms } from '@/hooks/queries'
import { MOON_BG } from '@/lib/academic'
import { cn } from '@/lib/utils'
import { groupByDepartment } from './group'

const AWARD_OPTIONS: { value: AwardLevel; label: string }[] = [
  { value: 'undergraduate', label: 'Undergrad' },
  { value: 'postgraduate', label: 'Postgrad' },
  { value: 'diploma', label: 'Diploma' },
]

export function CollegePage() {
  const { collegeId = '' } = useParams()
  const college = useColleges().data?.find((c) => c.id === collegeId)
  const departments = useDepartments(collegeId)
  const programs = usePrograms({ collegeId })
  const [award, setAward] = useState<AwardLevel>('undergraduate')

  const availableAwards = AWARD_OPTIONS.filter((o) => programs.data?.some((p) => p.awardLevel === o.value))
  // Some units only run postgraduate programmes: fall back to what exists.
  const activeAward = availableAwards.some((o) => o.value === award) ? award : (availableAwards[0]?.value ?? award)
  const groups = useMemo(
    () => groupByDepartment(departments.data ?? [], programs.data ?? [], activeAward),
    [departments.data, programs.data, activeAward],
  )
  const loading = departments.isPending || programs.isPending

  return (
    <div>
      <PageHeader title={college?.short} />
      <section
        className={cn(
          'relative mb-6 overflow-hidden rounded-[32px] p-6 text-[#1a0e16]',
          college ? MOON_BG[college.color] : 'bg-surface-2',
        )}
      >
        <span aria-hidden className="absolute -top-10 -right-10 size-36 rounded-full border-[18px] border-black/10" />
        <span aria-hidden className="absolute right-12 bottom-[-3rem] size-24 rounded-full border-[12px] border-black/10" />
        <p className="font-display text-5xl font-extrabold">{college?.short ?? '…'}</p>
        <h1 className="relative mt-2 max-w-[16rem] text-2xl leading-tight font-bold">{college?.name}</h1>
        <p className="relative mt-3 text-sm font-bold opacity-70">
          {programs.data?.length ?? 0} programmes · {departments.data?.length ?? 0} departments
        </p>
      </section>

      {availableAwards.length > 1 && (
        <Segmented label="Programme level" value={activeAward} onChange={setAward} options={availableAwards} className="mb-6" />
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map(({ department, programs: list }) => (
            <section key={department.id} aria-label={department.name}>
              <p className="text-xs font-bold tracking-wider text-faint uppercase">{department.faculty}</p>
              <h2 className="mb-1 text-lg font-bold">{department.name}</h2>
              <ul className="-mx-3">
                {list.map((program) => (
                  <li key={program.id}>
                    <ProgramRow program={program} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {groups.length === 0 && <p className="text-muted">No programmes at this level yet.</p>}
        </div>
      )}
    </div>
  )
}
