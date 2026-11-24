import { describe, expect, it } from 'vitest'
import { detectMedia } from './media'

describe('detectMedia', () => {
  it('trusts a known MIME type first', () => {
    expect(detectMedia('blob:https://x/123', 'application/pdf')).toEqual({ type: 'pdf' })
    expect(detectMedia('blob:https://x/123', 'image/png')).toEqual({ type: 'image' })
    expect(detectMedia('blob:https://x/123', 'video/mp4')).toEqual({ type: 'video' })
  })

  it('falls back to the file extension, ignoring query strings and case', () => {
    expect(detectMedia('https://cdn/x/paper.PDF?token=1', null)).toEqual({ type: 'pdf' })
    expect(detectMedia('/demo/photo.webp', null)).toEqual({ type: 'image' })
    expect(detectMedia('/demo/clip.mp4#t=3', null)).toEqual({ type: 'video' })
  })

  it('recognises YouTube links in their common shapes', () => {
    const id = 'dQw4w9WgXcQ'
    for (const url of [
      `https://www.youtube.com/watch?v=${id}&t=10`,
      `https://youtu.be/${id}`,
      `https://m.youtube.com/watch?v=${id}`,
      `https://www.youtube.com/shorts/${id}`,
      `https://www.youtube.com/embed/${id}`,
    ]) {
      expect(detectMedia(url, null)).toEqual({ type: 'youtube', videoId: id })
    }
  })

  it('treats Office files, web pages and lookalike hosts as external', () => {
    expect(detectMedia('/x/slides.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')).toEqual({ type: 'external' })
    expect(detectMedia('https://admissions.ucc.edu.gh/catalogue', null)).toEqual({ type: 'external' })
    expect(detectMedia('https://youtube.com.evil.io/watch?v=dQw4w9WgXcQ', null)).toEqual({ type: 'external' })
  })
})
