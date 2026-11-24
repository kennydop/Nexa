export const MAX_FILE_BYTES = 25 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/msword',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

export const ACCEPT_ATTR = '.pdf,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.doc,.docx,.mp4,.webm,.mov'

/** Returns an error message, or null when the file can be uploaded. */
export function validateFile(file: File): string | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a PDF, image, video, PowerPoint or Word file.'
  }
  if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_BYTES) return 'Videos must be 50 MB or smaller. For longer videos, share a YouTube link.'
  } else if (file.size > MAX_FILE_BYTES) return 'Files must be 25 MB or smaller.'
  if (file.size === 0) return 'That file is empty.'
  return null
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
