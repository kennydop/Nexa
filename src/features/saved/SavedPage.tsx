import { BookmarkSimple } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { CourseRow } from '@/components/CourseRow'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/context'
import { useBookmarks } from '@/hooks/queries'

export function SavedPage() {
  const { userId, requestSignIn } = useAuth()
  const bookmarks = useBookmarks(Boolean(userId))

  return (
    <div className="pt-safe flex flex-col gap-6 pt-4">
      <h1 className="text-[2rem] leading-tight font-extrabold">Saved</h1>
      {!userId ? (
        <EmptyState
          icon={BookmarkSimple}
          title="Keep your courses close"
          body="Sign in to save courses and jump back to their materials and past questions."
          action={<Button onClick={() => requestSignIn()}>Sign in</Button>}
        />
      ) : bookmarks.isPending ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[4.5rem]" />)
      ) : bookmarks.data?.length ? (
        <ul className="-mx-2">
          {bookmarks.data.map((course) => (
            <li key={course.id}>
              <CourseRow course={course} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={BookmarkSimple}
          title="Nothing saved yet"
          body="Tap the bookmark on any course to keep it here."
          action={
            <Button asChild variant="secondary">
              <Link to="/explore">Explore courses</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
