import { useState, type ReactNode } from 'react'
import { detectMedia } from '@/lib/media'
import { FileViewer, type ViewableFile } from './FileViewer'

interface FileOpenerProps {
  file: ViewableFile
  className?: string
  children: ReactNode
}

/** Opens PDFs, images and videos in the in-app viewer; web pages in a new tab. */
export function FileOpener({ file, className, children }: FileOpenerProps) {
  const [open, setOpen] = useState(false)
  if (detectMedia(file.url, file.mimeType).type === 'external') {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <FileViewer file={open ? file : null} onClose={() => setOpen(false)} />
    </>
  )
}
