import { CircleNotch, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react'
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

GlobalWorkerOptions.workerSrc = workerUrl

const ZOOMS = [1, 1.5, 2, 3]
const PAGE_GAP = 12

interface PageProps {
  doc: PDFDocumentProxy
  pageNumber: number
  width: number
  aspect: number
}

/** Renders one page when it scrolls near the viewport, at device pixel density. */
function PdfPage({ doc, pageNumber, width, aspect }: PageProps) {
  const holder = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: '600px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !canvas.current || width === 0) return
    let task: RenderTask | null = null
    let cancelled = false
    doc.getPage(pageNumber).then((page) => {
      if (cancelled || !canvas.current) return
      const base = page.getViewport({ scale: 1 })
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const viewport = page.getViewport({ scale: (width / base.width) * dpr })
      canvas.current.width = viewport.width
      canvas.current.height = viewport.height
      task = page.render({ canvas: canvas.current, viewport })
      task.promise.catch(() => {
        // Cancelled on zoom or unmount: nothing to do.
      })
    })
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, pageNumber, width, visible])

  return (
    <div
      ref={holder}
      className="relative mx-auto bg-white shadow-[0_6px_24px_-10px_rgb(0_0_0/0.5)]"
      style={{ width, height: width * aspect, marginBottom: PAGE_GAP }}
    >
      <canvas ref={canvas} role="img" aria-label={`Page ${pageNumber}`} className="block size-full" />
    </div>
  )
}

export default function PdfView({ url }: { url: string }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [aspect, setAspect] = useState(1.414)
  const [failed, setFailed] = useState(false)
  const [fitWidth, setFitWidth] = useState(0)
  const [zoomIndex, setZoomIndex] = useState(0)

  useEffect(() => {
    const task = getDocument({ url })
    task.promise
      .then(async (loaded) => {
        const first = (await loaded.getPage(1)).getViewport({ scale: 1 })
        setAspect(first.height / first.width)
        setDoc(loaded)
      })
      .catch(() => setFailed(true))
    return () => {
      task.destroy()
    }
  }, [url])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setFitWidth(Math.max(entry.contentRect.width - 24, 0)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const width = Math.round(fitWidth * ZOOMS[zoomIndex])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-auto overscroll-contain bg-[#2a1c2b] px-3 py-3">
        {failed ? (
          <p className="mt-20 text-center text-[#f7eee6]">This PDF couldn’t be opened. Try downloading it instead.</p>
        ) : !doc ? (
          <div className="mt-24 flex flex-col items-center gap-3 text-[#b9a6ae]">
            <CircleNotch size={32} className="animate-spin" />
            Opening PDF…
          </div>
        ) : (
          <div style={{ width: Math.max(width, fitWidth) }} className="mx-auto">
            {Array.from({ length: doc.numPages }, (_, i) => (
              <PdfPage key={i} doc={doc} pageNumber={i + 1} width={width} aspect={aspect} />
            ))}
          </div>
        )}
      </div>
      {doc && (
        <div className="pb-safe pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <div className="pointer-events-auto mb-2 flex items-center gap-1 rounded-full bg-black/70 p-1 text-white backdrop-blur">
            <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/15" aria-label="Zoom out" disabled={zoomIndex === 0} onClick={() => setZoomIndex((z) => z - 1)}>
              <MagnifyingGlassMinus size={20} />
            </Button>
            <span className="min-w-20 text-center text-sm font-bold tabular-nums">
              {doc.numPages} {doc.numPages === 1 ? 'page' : 'pages'} · {Math.round(ZOOMS[zoomIndex] * 100)}%
            </span>
            <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/15" aria-label="Zoom in" disabled={zoomIndex === ZOOMS.length - 1} onClick={() => setZoomIndex((z) => z + 1)}>
              <MagnifyingGlassPlus size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
