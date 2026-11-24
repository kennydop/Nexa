import { ArrowFatDown, ArrowFatUp, ChatCircle, PaperPlaneRight, SealCheck } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StarRating } from '@/components/ui/star-rating'
import type { Post, UserRole } from '@/data/types'
import { useAuth } from '@/features/auth/context'
import { useAddPost, useReplies, useVote } from '@/hooks/queries'
import { cn, errorMessage, timeAgo } from '@/lib/utils'

const BADGES = {
  lecturer: { label: 'Lecturer', className: 'bg-sky/20 text-sky', verifiedOnly: true },
  student: { label: 'UCC student', className: 'bg-mint/20 text-mint', verifiedOnly: true },
  visitor: { label: 'Visitor', className: 'bg-surface-3 text-muted', verifiedOnly: false },
} satisfies Record<UserRole, { label: string; className: string; verifiedOnly: boolean }>

/** Lecturer and student badges appear only once verified (UCC email or moderator). */
function RoleBadge({ role, verified }: { role: UserRole; verified: boolean }) {
  const badge = BADGES[role]
  if (badge.verifiedOnly && !verified) return null
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-bold', badge.className)}>
      {badge.verifiedOnly && <SealCheck size={12} weight="fill" />}
      {badge.label}
    </span>
  )
}

function VoteControl({ post }: { post: Post }) {
  const { userId, requestSignIn } = useAuth()
  const vote = useVote(post.courseId)
  const cast = (value: -1 | 1) => {
    if (!userId) {
      requestSignIn('Sign in to vote on posts.')
      return
    }
    vote.mutate(
      { postId: post.id, value: post.myVote === value ? 0 : value },
      { onError: (error) => toast.error(errorMessage(error)) },
    )
  }
  return (
    <div className="flex items-center rounded-full bg-surface-2">
      <button
        type="button"
        aria-label="Helpful"
        aria-pressed={post.myVote === 1}
        onClick={() => cast(1)}
        className={cn('grid size-9 place-items-center rounded-full transition-colors', post.myVote === 1 ? 'text-brand' : 'text-muted hover:text-text')}
      >
        <ArrowFatUp size={18} weight={post.myVote === 1 ? 'fill' : 'duotone'} />
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-label={`Score ${post.score}`}>
        {post.score}
      </span>
      <button
        type="button"
        aria-label="Not helpful"
        aria-pressed={post.myVote === -1}
        onClick={() => cast(-1)}
        className={cn('grid size-9 place-items-center rounded-full transition-colors', post.myVote === -1 ? 'text-danger' : 'text-muted hover:text-text')}
      >
        <ArrowFatDown size={18} weight={post.myVote === -1 ? 'fill' : 'duotone'} />
      </button>
    </div>
  )
}

function Replies({ post }: { post: Post }) {
  const { userId, requestSignIn } = useAuth()
  const replies = useReplies(post.id, true)
  const addPost = useAddPost()
  const [body, setBody] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!userId) {
      requestSignIn('Sign in to reply.')
      return
    }
    const text = body.trim()
    if (text.length < 2) return
    addPost.mutate(
      { courseId: post.courseId, body: text, rating: null, parentId: post.id },
      { onSuccess: () => setBody(''), onError: (error) => toast.error(errorMessage(error)) },
    )
  }

  return (
    <div className="mt-3 border-l-2 border-line pl-4">
      <ul className="flex flex-col gap-3">
        {replies.data?.map((reply) => (
          <li key={reply.id} className="flex gap-2.5">
            <Avatar name={reply.authorName} className="size-7 text-[0.6rem]" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-bold">{reply.authorName}</span>
                <RoleBadge role={reply.authorRole} verified={reply.authorVerified} />
                <span className="text-faint">{timeAgo(reply.createdAt)}</span>
              </p>
              <p className="mt-0.5 text-[0.95rem] leading-relaxed whitespace-pre-line">{reply.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…"
          aria-label="Reply"
          maxLength={2000}
          className="h-10 rounded-full"
        />
        <Button type="submit" size="icon-sm" disabled={addPost.isPending || body.trim().length < 2} aria-label="Send reply">
          <PaperPlaneRight size={18} weight="fill" />
        </Button>
      </form>
    </div>
  )
}

export function PostCard({ post }: { post: Post }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="rounded-[22px] border border-line bg-surface p-4 shadow-card">
      <header className="flex items-center gap-3">
        <Avatar name={post.authorName} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-bold">{post.authorName}</span>
            <RoleBadge role={post.authorRole} verified={post.authorVerified} />
          </p>
          <p className="text-xs text-faint">{timeAgo(post.createdAt)}</p>
        </div>
        {post.rating ? <StarRating value={post.rating} size={14} /> : null}
      </header>
      <p className="mt-3 text-[0.95rem] leading-relaxed whitespace-pre-line">{post.body}</p>
      <footer className="mt-3 flex items-center gap-2">
        <VoteControl post={post} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <ChatCircle size={18} />
          {post.replyCount > 0 ? `${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
        </button>
      </footer>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Replies post={post} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
