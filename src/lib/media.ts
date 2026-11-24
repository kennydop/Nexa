export type MediaKind =
  | { type: 'pdf' }
  | { type: 'image' }
  | { type: 'video' }
  | { type: 'youtube'; videoId: string }
  | { type: 'external' }

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']
const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v']
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']
const YOUTUBE_ID = /^[\w-]{11}$/

function extensionOf(url: string): string {
  const path = url.split(/[?#]/)[0]
  const dot = path.lastIndexOf('.')
  return dot === -1 ? '' : path.slice(dot + 1).toLowerCase()
}

function youtubeId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null
  const candidate =
    parsed.hostname === 'youtu.be'
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] ?? '')
  return YOUTUBE_ID.test(candidate) ? candidate : null
}

/** Decides which in-app viewer can open a file or link. */
export function detectMedia(url: string, mimeType: string | null): MediaKind {
  if (mimeType === 'application/pdf') return { type: 'pdf' }
  if (mimeType?.startsWith('image/')) return { type: 'image' }
  if (mimeType?.startsWith('video/')) return { type: 'video' }

  const videoId = youtubeId(url)
  if (videoId) return { type: 'youtube', videoId }

  if (!mimeType) {
    const ext = extensionOf(url)
    if (ext === 'pdf') return { type: 'pdf' }
    if (IMAGE_EXT.includes(ext)) return { type: 'image' }
    if (VIDEO_EXT.includes(ext)) return { type: 'video' }
  }
  return { type: 'external' }
}
