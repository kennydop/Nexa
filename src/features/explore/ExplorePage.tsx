import { CaretRight } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useColleges } from '@/hooks/queries'
import { MOON_BG } from '@/lib/academic'
import { UNIVERSITY } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function ExplorePage() {
  const { data: colleges, isPending, isError, refetch } = useColleges()
  return (
    <div className="pt-safe flex flex-col gap-6 pt-4">
      <header>
        <p className="text-sm font-semibold text-muted">{UNIVERSITY}</p>
        <h1 className="text-[2rem] leading-tight font-extrabold">Explore programmes</h1>
        <p className="mt-2 text-muted">Pick a college, then a department, to see every programme and its courses.</p>
      </header>

      {isError && (
        <button type="button" onClick={() => refetch()} className="rounded-2xl bg-danger/10 p-4 text-left text-danger">
          Couldn’t load colleges. Tap to retry.
        </button>
      )}

      <ul className="flex flex-col gap-3">
        {isPending
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-24 rounded-[24px]" />
              </li>
            ))
          : colleges?.map((college) => (
              <li key={college.id}>
                <Link
                  to={`/college/${college.id}`}
                  className="group flex items-center gap-4 rounded-[24px] border border-line bg-surface p-3 shadow-card transition-transform duration-150 active:scale-[0.98]"
                >
                  <span
                    className={cn(
                      'grid size-[4.5rem] shrink-0 place-items-center rounded-[20px] font-display text-lg font-extrabold text-[#1a0e16]',
                      MOON_BG[college.color],
                    )}
                  >
                    {college.short}
                  </span>
                  <span className="min-w-0 flex-1 font-bold leading-snug">{college.name}</span>
                  <CaretRight size={20} weight="bold" className="mr-1 text-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
      </ul>
    </div>
  )
}
