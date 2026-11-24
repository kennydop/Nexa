import { BookmarkSimple, BookOpenText, ChatsCircle, Exam, FolderSimple } from '@phosphor-icons/react'
import { useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/context'
import { useCourse, useCourseStats, useIsBookmarked, useSetBookmark } from '@/hooks/queries'
import { errorMessage } from '@/lib/utils'
import { DiscussionTab } from './DiscussionTab'
import { MaterialsTab } from './MaterialsTab'
import { PastQuestionsTab } from './PastQuestionsTab'

type CourseTab = 'discuss' | 'materials' | 'past'
const TABS: CourseTab[] = ['discuss', 'materials', 'past']

function Count({ value }: { value: number | undefined }) {
  if (!value) return null
  return <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[0.7rem] leading-none text-text">{value}</span>
}

export function CoursePage() {
  const { courseId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { userId, requestSignIn } = useAuth()
  const course = useCourse(courseId)
  const stats = useCourseStats(courseId)
  const saved = useIsBookmarked(courseId, Boolean(userId))
  const setBookmark = useSetBookmark(courseId)

  const tabParam = params.get('tab') as CourseTab | null
  const tab: CourseTab = tabParam && TABS.includes(tabParam) ? tabParam : 'discuss'

  function toggleSave() {
    if (!userId) {
      requestSignIn('Sign in to save courses for quick access.')
      return
    }
    const next = !saved.data
    setBookmark.mutate(next, {
      onSuccess: () => toast.success(next ? 'Saved' : 'Removed from saved'),
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  if (course.isPending) {
    return (
      <div className="pt-safe flex flex-col gap-4 pt-16">
        <Skeleton className="h-44 rounded-[32px]" />
        <Skeleton className="h-12" />
      </div>
    )
  }
  if (!course.data) {
    return (
      <>
        <PageHeader />
        <EmptyState icon={BookOpenText} title="Course not found" body="Check the course code and try searching again." />
      </>
    )
  }

  const { code, title, creditHours } = course.data
  const [prefix, number] = code.split(' ')

  return (
    <div>
      <PageHeader
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSave}
            aria-pressed={Boolean(saved.data)}
            aria-label={saved.data ? 'Remove from saved' : 'Save course'}
          >
            <BookmarkSimple size={24} weight={saved.data ? 'fill' : 'duotone'} className={saved.data ? 'text-brand' : ''} />
          </Button>
        }
      />

      <section className="grain relative mb-5 overflow-hidden rounded-[32px] bg-plum p-6 text-[#f7eee6]">
        <div aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full bg-brand/35 blur-2xl" />
        <div aria-hidden className="absolute right-6 bottom-6 size-16 rounded-full border-[10px] border-white/10" />
        <p className="relative font-display leading-none font-extrabold">
          <span className="text-lg text-brand">{prefix}</span>{' '}
          <span className="text-6xl tracking-tight">{number}</span>
        </p>
        <h1 className="relative mt-3 text-2xl leading-tight font-bold">{title}</h1>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[#f7eee6]/80">
          {creditHours ? <span>{creditHours} credit hours</span> : null}
          {stats.data?.avgRating ? (
            <span className="flex items-center gap-1.5">
              <StarRating value={stats.data.avgRating} size={14} />
              {stats.data.avgRating.toFixed(1)} ({stats.data.ratingCount})
            </span>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </section>

      <Tabs value={tab} onValueChange={(next) => setParams({ tab: next }, { replace: true })}>
        <TabsList className="-mx-5 px-2">
          <TabsTrigger value="discuss">
            <ChatsCircle size={20} />
            Discuss <Count value={stats.data?.posts} />
          </TabsTrigger>
          <TabsTrigger value="materials">
            <FolderSimple size={20} />
            Materials <Count value={stats.data?.materials} />
          </TabsTrigger>
          <TabsTrigger value="past">
            <Exam size={20} />
            Past Qs <Count value={stats.data?.pastQuestions} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="discuss">
          <DiscussionTab courseId={courseId} />
        </TabsContent>
        <TabsContent value="materials">
          <MaterialsTab courseId={courseId} />
        </TabsContent>
        <TabsContent value="past">
          <PastQuestionsTab courseId={courseId} courseCode={code} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
