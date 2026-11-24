import { ArrowSquareOut, Eye, Play } from '@phosphor-icons/react'
import { detectMedia } from '@/lib/media'

/** Trailing hint: play for video, eye for in-app preview, arrow for external. */
export function MediaBadge({ url, mimeType }: { url: string; mimeType: string | null }) {
  const type = detectMedia(url, mimeType).type
  if (type === 'video' || type === 'youtube') return <Play size={20} weight="fill" className="shrink-0 text-brand" />
  if (type === 'external') return <ArrowSquareOut size={20} className="shrink-0 text-faint" />
  return <Eye size={20} className="shrink-0 text-faint" />
}
