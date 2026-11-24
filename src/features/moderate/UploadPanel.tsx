import { Exam, FileArrowUp, MagnifyingGlass } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import type { Course } from '@/data/types'
import { UploadMaterialSheet } from '@/features/course/UploadMaterialSheet'
import { UploadPastQuestionSheet } from '@/features/course/UploadPastQuestionSheet'
import { useDebounced } from '@/hooks/useDebounced'
import { useSearch } from '@/hooks/queries'

const SEARCH_DEBOUNCE_MS = 250
const MAX_RESULTS = 12

type Target = { course: Course; kind: 'material' | 'past_question' } | null

export function UploadPanel() {
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<Target>(null)
  const debounced = useDebounced(query, SEARCH_DEBOUNCE_MS)
  const search = useSearch(debounced)
  const courses = debounced.trim().length >= 2 ? (search.data?.courses ?? []).slice(0, MAX_RESULTS) : []
  const close = (open: boolean) => !open && setTarget(null)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">Find a course, then add slides, notes, videos or past questions to it.</p>
      <label className="relative block">
        <MagnifyingGlass size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Course code or title, e.g. MAT 105"
          aria-label="Search courses"
          className="pl-11"
        />
      </label>
      {courses.length === 0 ? (
        <EmptyState
          icon={FileArrowUp}
          title={debounced.trim().length >= 2 ? 'No matching courses' : 'Search for a course'}
          body={debounced.trim().length >= 2 ? 'Add it under Curriculum first.' : 'Type at least two characters.'}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {courses.map((course) => (
            <li key={course.id} className="rounded-[22px] border border-line bg-surface p-4 shadow-card">
              <p className="text-xs font-bold text-brand">{course.code}</p>
              <p className="font-semibold leading-snug">{course.title}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button size="sm" onClick={() => setTarget({ course, kind: 'material' })}>
                  <FileArrowUp size={18} />
                  Material
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setTarget({ course, kind: 'past_question' })}>
                  <Exam size={18} />
                  Past question
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {target && (
        <>
          <UploadMaterialSheet courseId={target.course.id} open={target.kind === 'material'} onOpenChange={close} />
          <UploadPastQuestionSheet courseId={target.course.id} open={target.kind === 'past_question'} onOpenChange={close} />
        </>
      )}
    </div>
  )
}
