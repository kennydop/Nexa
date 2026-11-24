import { Exam, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FileOpener } from '@/components/viewer/FileOpener'
import { MediaBadge } from '@/components/viewer/MediaBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { PastQuestion } from '@/data/types'
import { useAuth } from '@/features/auth/context'
import { usePastQuestions } from '@/hooks/queries'
import { EXAM_LABEL } from './meta'
import { UploadPastQuestionSheet } from './UploadPastQuestionSheet'


function groupByYear(list: PastQuestion[]): [number, PastQuestion[]][] {
  const groups = new Map<number, PastQuestion[]>()
  list.forEach((q) => groups.set(q.year, [...(groups.get(q.year) ?? []), q]))
  return [...groups.entries()].sort(([a], [b]) => b - a)
}

export function PastQuestionsTab({ courseId, courseCode }: { courseId: string; courseCode?: string }) {
  const { userId, requestSignIn } = useAuth()
  const questions = usePastQuestions(courseId)
  const [uploading, setUploading] = useState(false)
  const openUpload = () => (userId ? setUploading(true) : requestSignIn('Sign in to upload past questions.'))

  return (
    <div className="flex flex-col gap-4">
      <Button variant="secondary" onClick={openUpload} className="self-start">
        <Plus size={18} weight="bold" />
        Upload past questions
      </Button>

      {questions.isPending ? (
        Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-24" />)
      ) : questions.data?.length ? (
        groupByYear(questions.data).map(([year, list]) => (
          <section key={year} aria-label={String(year)}>
            <h3 className="mb-2 font-display text-3xl font-extrabold text-faint">{year}</h3>
            <ul className="grid grid-cols-2 gap-2">
              {list.map((q) => (
                <li key={q.id}>
                  <FileOpener
                    file={{
                      title: `${courseCode ?? 'Past question'} · ${q.year} ${EXAM_LABEL[q.examType]}`,
                      subtitle: `Semester ${q.semester} · uploaded by ${q.uploaderName}`,
                      url: q.url,
                      mimeType: q.mimeType,
                    }}
                    className="flex h-full w-full flex-col justify-between gap-3 rounded-[20px] border border-line bg-surface p-4 text-left shadow-card transition-transform duration-150 active:scale-[0.98]"
                  >
                    <span className="flex items-start justify-between">
                      <Exam size={28} className="text-brand" />
                      <MediaBadge url={q.url} mimeType={q.mimeType} />
                    </span>
                    <span>
                      <span className="block font-bold">Semester {q.semester}</span>
                      <span className="block text-sm text-muted">{EXAM_LABEL[q.examType]}</span>
                    </span>
                  </FileOpener>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <EmptyState
          icon={Exam}
          title="No past questions yet"
          body="Got an old exam paper? Snap or scan it and upload it here to help the next set of students."
        />
      )}

      <UploadPastQuestionSheet courseId={courseId} open={uploading} onOpenChange={setUploading} />
    </div>
  )
}
