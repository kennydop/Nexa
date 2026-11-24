import * as Dialog from '@radix-ui/react-dialog'
import { ArrowSquareOut, CircleNotch, DownloadSimple, FileX, X } from '@phosphor-icons/react'
import { lazy, Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { detectMedia } from '@/lib/media'
import { cn } from '@/lib/utils'

const PdfView = lazy(() => import('./PdfView'))

export interface ViewableFile {
  title: string
  subtitle?: string
  url: string
  mimeType: string | null
}

/** Supabase serves a forced download when ?download is present. */
function downloadUrl(url: string): string {
  return url.includes('/storage/v1/object/public/') ? `${url}${url.includes('?') ? '&' : '?'}download=` : url
}

function ImageView({ url, title }: { url: string; title: string }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <div className={cn('min-h-0 flex-1 overscroll-contain bg-black', zoomed ? 'overflow-auto' : 'grid place-items-center overflow-hidden')}>
      <img
        src={url}
        alt={title}
        onClick={() => setZoomed((z) => !z)}
        className={cn(
          'select-none',
          zoomed ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain',
        )}
        style={zoomed ? { width: '220%' } : undefined}
      />
    </div>
  )
}

function Unsupported({ url }: { url: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#140a12] px-8 text-center text-[#f7eee6]">
      <FileX size={48} className="text-[#f0a062]" />
      <p className="max-w-xs text-[#b9a6ae]">This file type can’t be previewed in Nexa. Open it in another app instead.</p>
      <Button asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ArrowSquareOut size={18} />
          Open
        </a>
      </Button>
    </div>
  )
}

interface FileViewerProps {
  file: ViewableFile | null
  onClose: () => void
}

/** Full-screen in-app viewer for PDFs, images, videos and YouTube links. */
export function FileViewer({ file, onClose }: FileViewerProps) {
  const media = file ? detectMedia(file.url, file.mimeType) : null
  return (
    <Dialog.Root open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col bg-[#140a12] text-[#f7eee6] outline-none"
        >
          {file && media && (
            <>
              <header className="pt-safe flex items-center gap-2 border-b border-white/10 px-2 pb-2">
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Close" className="text-[#f7eee6] hover:bg-white/10">
                    <X size={22} weight="bold" />
                  </Button>
                </Dialog.Close>
                <div className="min-w-0 flex-1">
                  <Dialog.Title className="truncate font-bold">{file.title}</Dialog.Title>
                  {file.subtitle && <p className="truncate text-xs text-[#b9a6ae]">{file.subtitle}</p>}
                </div>
                {media.type !== 'youtube' && (
                  <Button asChild variant="ghost" size="icon" className="text-[#f7eee6] hover:bg-white/10">
                    <a href={downloadUrl(file.url)} download aria-label="Download">
                      <DownloadSimple size={22} />
                    </a>
                  </Button>
                )}
                <Button asChild variant="ghost" size="icon" className="text-[#f7eee6] hover:bg-white/10">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label="Open in browser">
                    <ArrowSquareOut size={22} />
                  </a>
                </Button>
              </header>

              {media.type === 'pdf' && (
                <Suspense
                  fallback={
                    <div className="grid flex-1 place-items-center">
                      <CircleNotch size={32} className="animate-spin text-[#b9a6ae]" />
                    </div>
                  }
                >
                  <PdfView url={file.url} />
                </Suspense>
              )}
              {media.type === 'image' && <ImageView url={file.url} title={file.title} />}
              {media.type === 'video' && (
                <div className="grid min-h-0 flex-1 place-items-center bg-black">
                  <video src={file.url} controls playsInline autoPlay preload="metadata" className="max-h-full w-full">
                    <track kind="captions" />
                  </video>
                </div>
              )}
              {media.type === 'youtube' && (
                <div className="grid flex-1 place-items-center bg-black">
                  <iframe
                    title={file.title}
                    src={`https://www.youtube-nocookie.com/embed/${media.videoId}?playsinline=1&rel=0`}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              )}
              {media.type === 'external' && <Unsupported url={file.url} />}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
