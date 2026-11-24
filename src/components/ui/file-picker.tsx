import { FileArrowUp, FilePdf, X } from '@phosphor-icons/react'
import { useRef } from 'react'
import { ACCEPT_ATTR, formatBytes } from '@/lib/files'
import { cn } from '@/lib/utils'

interface FilePickerProps {
  id: string
  file: File | null
  onChange: (file: File | null) => void
  invalid?: boolean
}

export function FilePicker({ id, file, onChange, invalid }: FilePickerProps) {
  const input = useRef<HTMLInputElement>(null)
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3">
        <FilePdf size={32} className="shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{file.name}</p>
          <p className="text-sm text-muted">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove file"
          className="grid size-9 place-items-center rounded-full hover:bg-surface-3"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    )
  }
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          'flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-surface-2 px-4 py-6 text-center transition-colors duration-150 hover:border-brand',
          invalid ? 'border-danger' : 'border-line-strong',
        )}
      >
        <FileArrowUp size={34} className="text-brand" />
        <span className="font-bold">Choose a file</span>
        <span className="text-sm text-muted">PDF, slides, Word, photos or video</span>
      </button>
      <input
        ref={input}
        id={id}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </>
  )
}
