import { useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context'
import { nudgeStore } from '@/features/plans/useNudges'
import { detectMedia } from '@/lib/media'
import { FileViewer, type ViewableFile } from './FileViewer'

interface FileOpenerProps {
  file: ViewableFile
  className?: string
  children: ReactNode
}

/** Opens PDFs, images and videos in the in-app viewer; web pages in a new tab. */
export function FileOpener({ file, className, children }: FileOpenerProps) {
  const { userId } = useAuth()
  const [open, setOpen] = useState(false)
  const [suggest, setSuggest] = useState(false)
  const media = detectMedia(file.url, file.mimeType).type

  function openViewer() {
    const studying = nudgeStore.openFile()
    setSuggest(Boolean(userId) && (media === 'pdf' || media === 'image') && studying)
    setOpen(true)
  }

  if (media === 'external') {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <>
      <button type="button" onClick={openViewer} className={className}>
        {children}
      </button>
      <FileViewer
        file={open ? file : null}
        onClose={() => setOpen(false)}
        suggestAssistant={suggest}
        onSuggestionDone={() => setSuggest(false)}
      />
    </>
  )
}
