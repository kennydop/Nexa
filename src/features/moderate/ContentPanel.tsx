import { ChatCircleText, Eye, EyeSlash, FileText, Exam, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ConfirmSheet } from '@/components/ui/confirm-sheet'
import { EmptyState } from '@/components/ui/empty-state'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import { FileOpener } from '@/components/viewer/FileOpener'
import type { ContentKind, ModerationItem } from '@/data/types'
import { cn, timeAgo } from '@/lib/utils'
import { useDeleteContent, useModerationFeed, useSetContentStatus } from './queries'

type Filter = 'all' | 'post' | 'files' | 'hidden'

const KIND = {
  post: { label: 'Post', icon: ChatCircleText },
  material: { label: 'Material', icon: FileText },
  past_question: { label: 'Past question', icon: Exam },
} satisfies Record<ContentKind, { label: string; icon: typeof FileText }>

function matches(item: ModerationItem, filter: Filter): boolean {
  if (filter === 'post') return item.kind === 'post'
  if (filter === 'files') return item.kind !== 'post'
  if (filter === 'hidden') return item.status === 'hidden'
  return true
}

function Row({ item, onDelete }: { item: ModerationItem; onDelete: (item: ModerationItem) => void }) {
  const setStatus = useSetContentStatus()
  const meta = KIND[item.kind]
  const hidden = item.status === 'hidden'
  return (
    <li className={cn('rounded-[22px] border border-line bg-surface p-4 shadow-card', hidden && 'opacity-70')}>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-muted">
        <meta.icon size={16} className="text-brand" />
        {meta.label}
        <span aria-hidden>·</span>
        <Link to={`/course/${item.courseId}`} className="text-brand uppercase hover:underline">
          {item.courseId.replace('-', ' ')}
        </Link>
        <span aria-hidden>·</span>
        {item.authorName}, {timeAgo(item.createdAt)}
        {hidden && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">Hidden</span>}
      </p>
      {item.url ? (
        <FileOpener
          file={{ title: item.title, subtitle: `${meta.label} by ${item.authorName}`, url: item.url, mimeType: item.mimeType }}
          className="mt-2 block text-left font-semibold leading-snug underline-offset-4 hover:underline"
        >
          {item.title}
        </FileOpener>
      ) : (
        <p className="mt-2 leading-snug">{item.title}</p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={setStatus.isPending}
          onClick={() => setStatus.mutate({ kind: item.kind, id: item.id, status: hidden ? 'published' : 'hidden' })}
        >
          {hidden ? <Eye size={18} /> : <EyeSlash size={18} />}
          {hidden ? 'Unhide' : 'Hide'}
        </Button>
        <Button size="sm" variant="ghost" className="text-danger" onClick={() => onDelete(item)}>
          <Trash size={18} />
          Delete
        </Button>
      </div>
    </li>
  )
}

export function ContentPanel() {
  const feed = useModerationFeed()
  const remove = useDeleteContent()
  const [filter, setFilter] = useState<Filter>('all')
  const [pendingDelete, setPendingDelete] = useState<ModerationItem | null>(null)
  const items = (feed.data ?? []).filter((item) => matches(item, filter))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Hiding takes something out of public view but keeps it, so it can be restored. Deleting is permanent.
      </p>
      <Segmented
        label="Filter content"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'post', label: 'Posts' },
          { value: 'files', label: 'Files' },
          { value: 'hidden', label: 'Hidden' },
        ]}
      />
      {feed.isPending ? (
        Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-[22px]" />)
      ) : items.length === 0 ? (
        <EmptyState icon={ChatCircleText} title="Nothing here" body="New posts and uploads will show up here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <Row key={`${item.kind}-${item.id}`} item={item} onDelete={setPendingDelete} />
          ))}
        </ul>
      )}
      <ConfirmSheet
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete permanently?"
        body={pendingDelete ? `“${pendingDelete.title.slice(0, 80)}” will be removed for everyone. This can’t be undone.` : ''}
        confirmLabel="Delete"
        busy={remove.isPending}
        onConfirm={() => {
          if (!pendingDelete) return
          remove.mutate({ kind: pendingDelete.kind, id: pendingDelete.id }, { onSettled: () => setPendingDelete(null) })
        }}
      />
    </div>
  )
}
