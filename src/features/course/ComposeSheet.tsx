import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Textarea } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { StarRating } from '@/components/ui/star-rating'
import { useAddPost } from '@/hooks/queries'
import { errorMessage } from '@/lib/utils'

const MIN_LENGTH = 10
const MAX_LENGTH = 2000

interface ComposeSheetProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposeSheet({ courseId, open, onOpenChange }: ComposeSheetProps) {
  const addPost = useAddPost()
  const [rating, setRating] = useState<number | null>(null)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string>()

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = body.trim()
    if (text.length < MIN_LENGTH) {
      setError(`Write at least ${MIN_LENGTH} characters so others get something useful.`)
      return
    }
    setError(undefined)
    addPost.mutate(
      { courseId, body: text, rating, parentId: null },
      {
        onSuccess: () => {
          toast.success('Posted. Thanks for sharing!')
          setBody('')
          setRating(null)
          onOpenChange(false)
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Share your view"
      description="Be kind and specific. Tips on workload, lectures and reading help most."
    >
      <form onSubmit={submit} className="flex flex-col gap-5 pb-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-muted">Your rating (optional)</p>
          <StarRating value={rating} onChange={setRating} size={26} />
        </div>
        <Field label="Your post" htmlFor="post-body" error={error} hint={`${body.length}/${MAX_LENGTH}`}>
          <Textarea
            id="post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_LENGTH}
            placeholder="What should someone know before taking this course?"
            aria-invalid={Boolean(error)}
            autoFocus
          />
        </Field>
        <Button type="submit" size="lg" block disabled={addPost.isPending}>
          {addPost.isPending ? 'Posting…' : 'Post'}
        </Button>
      </form>
    </Sheet>
  )
}
