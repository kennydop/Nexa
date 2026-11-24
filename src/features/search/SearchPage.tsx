import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useSearchParams } from 'react-router'
import { CourseRow } from '@/components/CourseRow'
import { ProgramRow } from '@/components/ProgramRow'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchPlansCard } from '@/features/plans/SearchPlansCard'
import { useDebounced } from '@/hooks/useDebounced'
import { useSearch } from '@/hooks/queries'

const SUGGESTIONS = ['Nursing', 'Accounting', 'MAT 105', 'Economics', 'Communicative Skills', 'Data Science']
const DEBOUNCE_MS = 200

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const debounced = useDebounced(query, DEBOUNCE_MS)
  const results = useSearch(debounced)
  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true })
  const hasQuery = debounced.trim().length >= 2
  const empty = hasQuery && results.data && !results.data.courses.length && !results.data.programs.length

  return (
    <div className="pt-safe flex flex-col gap-6 pt-4">
      <h1 className="text-[2rem] leading-tight font-extrabold">Search</h1>
      <div className="sticky top-2 z-20">
        <label className="flex h-14 items-center gap-3 rounded-[20px] border border-line bg-surface px-4 shadow-card focus-within:border-brand">
          <MagnifyingGlass size={22} className="text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Course code, course or programme"
            aria-label="Search courses and programmes"
            autoFocus
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-muted">
              <X size={20} weight="bold" />
            </button>
          )}
        </label>
      </div>

      {!hasQuery && (
        <section aria-labelledby="try-heading">
          <h2 id="try-heading" className="mb-3 text-sm font-bold tracking-wider text-faint uppercase">
            Try
          </h2>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setQuery(s)}
                  className="h-10 rounded-full border border-line bg-surface px-4 text-sm font-bold transition-colors hover:border-brand"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasQuery && <SearchPlansCard />}

      {empty && (
        <EmptyState icon={MagnifyingGlass} title="Nothing found" body={`No courses or programmes match “${debounced}”.`} />
      )}

      {hasQuery && results.data?.courses.length ? (
        <section aria-labelledby="courses-heading">
          <h2 id="courses-heading" className="mb-1 text-lg font-bold">
            Courses <span className="text-faint">{results.data.courses.length}</span>
          </h2>
          <ul className="-mx-2">
            {results.data.courses.map((course) => (
              <li key={course.id}>
                <CourseRow course={course} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasQuery && results.data?.programs.length ? (
        <section aria-labelledby="programs-heading">
          <h2 id="programs-heading" className="mb-1 text-lg font-bold">
            Programmes <span className="text-faint">{results.data.programs.length}</span>
          </h2>
          <ul className="-mx-3">
            {results.data.programs.map((program) => (
              <li key={program.id}>
                <ProgramRow program={program} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
