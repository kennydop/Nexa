import { ArrowUpRight } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useColleges } from '@/hooks/queries'
import { MOON_BG } from '@/lib/academic'
import { cn } from '@/lib/utils'

export function CollegeStrip() {
  const { data: colleges, isPending } = useColleges()
  return (
    <section aria-labelledby="colleges-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="colleges-heading" className="text-xl font-bold">
          Colleges
        </h2>
        <Link to="/explore" className="text-sm font-bold text-brand">
          Explore all
        </Link>
      </div>
      <ul className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-36 w-36 rounded-[26px]" />
              </li>
            ))
          : colleges?.map((college) => (
              <li key={college.id} className="snap-start">
                <Link
                  to={`/college/${college.id}`}
                  className={cn(
                    'relative flex h-36 w-36 flex-col justify-between overflow-hidden rounded-[26px] p-4 text-[#1a0e16] transition-transform duration-200 active:scale-[0.97]',
                    MOON_BG[college.color],
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute -top-6 -right-6 size-20 rounded-full border-[10px] border-black/10"
                  />
                  <span className="font-display text-2xl leading-none font-extrabold">{college.short}</span>
                  <span className="flex items-end justify-between gap-1">
                    <span className="line-clamp-3 text-xs leading-tight font-bold">{college.name}</span>
                    <ArrowUpRight size={18} weight="bold" className="shrink-0" />
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  )
}
