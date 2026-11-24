import { ChatsCircle, PencilSimpleLine } from '@phosphor-icons/react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import type { PostSort } from '@/data/repository'
import { useAuth } from '@/features/auth/context'
import { usePosts } from '@/hooks/queries'
import { ComposeSheet } from './ComposeSheet'
import { PostCard } from './PostCard'

export function DiscussionTab({ courseId }: { courseId: string }) {
  const { profile, userId, requestSignIn } = useAuth()
  const [sort, setSort] = useState<PostSort>('top')
  const [composing, setComposing] = useState(false)
  const posts = usePosts(courseId, sort)

  const openComposer = () =>
    userId ? setComposing(true) : requestSignIn('Sign in to share your view on this course.')

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={openComposer}
        className="flex items-center gap-3 rounded-[22px] border border-dashed border-line-strong bg-surface p-3 text-left transition-colors duration-150 hover:border-brand"
      >
        {profile ? (
          <Avatar name={profile.fullName} />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
            <PencilSimpleLine size={20} />
          </span>
        )}
        <span className="flex-1 text-muted">How is this course? Share tips, rate it…</span>
      </button>

      <Segmented
        label="Sort discussion"
        value={sort}
        onChange={setSort}
        options={[
          { value: 'top', label: 'Top' },
          { value: 'new', label: 'Newest' },
        ]}
        className="w-48"
      />

      {posts.isPending ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 rounded-[22px]" />)
      ) : posts.isError ? (
        <button type="button" onClick={() => posts.refetch()} className="rounded-2xl bg-danger/10 p-4 text-danger">
          Couldn’t load the discussion. Tap to retry.
        </button>
      ) : posts.data.length === 0 ? (
        <EmptyState
          icon={ChatsCircle}
          title="Start the conversation"
          body="Be the first to share what this course is really like: workload, tips, or what to read."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.data.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}

      <ComposeSheet courseId={courseId} open={composing} onOpenChange={setComposing} />
    </div>
  )
}
