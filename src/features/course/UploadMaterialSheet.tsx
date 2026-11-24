import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FilePicker } from '@/components/ui/file-picker'
import { Field, Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Sheet } from '@/components/ui/sheet'
import type { MaterialKind } from '@/data/types'
import { useAddMaterial } from '@/hooks/queries'
import { isSafeHttpsUrl, validateFile } from '@/lib/files'
import { cn, errorMessage } from '@/lib/utils'
import { KIND_META } from './meta'

const KINDS: MaterialKind[] = ['slides', 'notes', 'book', 'video', 'link']

interface Props {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Errors = Partial<Record<'title' | 'file' | 'link', string>>

export function UploadMaterialSheet({ courseId, open, onOpenChange }: Props) {
  const addMaterial = useAddMaterial()
  const [kind, setKind] = useState<MaterialKind>('slides')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  // Videos can be an upload or a YouTube link; "link" is always a link.
  const [videoAsLink, setVideoAsLink] = useState(false)
  const usesLink = kind === 'link' || (kind === 'video' && videoAsLink)

  function validate(): Errors {
    const next: Errors = {}
    if (title.trim().length < 3) next.title = 'Give it a clear title (3+ characters).'
    if (usesLink && !isSafeHttpsUrl(link.trim())) next.link = 'Paste a full https:// link.'
    if (!usesLink) {
      const fileError = file ? validateFile(file) : 'Choose a file to upload.'
      if (fileError) next.file = fileError
    }
    return next
  }

  function reset() {
    setTitle('')
    setFile(null)
    setLink('')
    setErrors({})
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return
    addMaterial.mutate(
      {
        courseId,
        kind,
        title: title.trim(),
        file: usesLink ? null : file,
        link: usesLink ? link.trim() : null,
      },
      {
        onSuccess: () => {
          toast.success('Material shared. Thank you!')
          reset()
          onOpenChange(false)
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Add material" description="Only share what you have the right to share.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 pb-4">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-muted">Type</legend>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => {
              const meta = KIND_META[k]
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={cn(
                    'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-colors duration-150',
                    kind === k ? 'border-brand bg-brand-soft text-text' : 'border-line text-muted hover:text-text',
                  )}
                >
                  <meta.icon size={18} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </fieldset>
        <Field label="Title" htmlFor="mat-title" error={errors.title}>
          <Input
            id="mat-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="e.g. Week 3 slides: Limits and continuity"
            aria-invalid={Boolean(errors.title)}
          />
        </Field>
        {kind === 'video' && (
          <Segmented
            label="Video source"
            value={videoAsLink ? 'link' : 'file'}
            onChange={(v) => setVideoAsLink(v === 'link')}
            options={[
              { value: 'file', label: 'Upload video' },
              { value: 'link', label: 'YouTube link' },
            ]}
          />
        )}
        {usesLink ? (
          <Field label="Link" htmlFor="mat-link" error={errors.link}>
            <Input
              id="mat-link"
              type="url"
              inputMode="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              aria-invalid={Boolean(errors.link)}
            />
          </Field>
        ) : (
          <Field label="File" htmlFor="mat-file" error={errors.file}>
            <FilePicker id="mat-file" file={file} onChange={setFile} invalid={Boolean(errors.file)} />
          </Field>
        )}
        <Button type="submit" size="lg" block disabled={addMaterial.isPending}>
          {addMaterial.isPending ? 'Uploading…' : 'Share material'}
        </Button>
      </form>
    </Sheet>
  )
}
