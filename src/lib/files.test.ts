import { describe, expect, it } from 'vitest'
import { formatBytes, isSafeHttpsUrl, MAX_FILE_BYTES, validateFile } from './files'

const file = (type: string, size: number) => new File([new Uint8Array(size)], 'x', { type })

describe('validateFile', () => {
  it('accepts a PDF under the limit', () => {
    expect(validateFile(file('application/pdf', 1000))).toBeNull()
  })
  it('rejects unsupported types', () => {
    expect(validateFile(file('application/zip', 1000))).toMatch(/PDF/)
  })
  it('rejects files over 25 MB', () => {
    expect(validateFile(file('application/pdf', MAX_FILE_BYTES + 1))).toMatch(/25 MB/)
  })
  it('allows videos up to 50 MB', () => {
    expect(validateFile(file('video/mp4', MAX_FILE_BYTES + 1))).toBeNull()
    expect(validateFile(file('video/mp4', 50 * 1024 * 1024 + 1))).toMatch(/50 MB/)
  })
  it('rejects empty files', () => {
    expect(validateFile(file('application/pdf', 0))).toMatch(/empty/)
  })
})

describe('isSafeHttpsUrl', () => {
  it('only allows https links', () => {
    expect(isSafeHttpsUrl('https://youtube.com/watch?v=1')).toBe(true)
    expect(isSafeHttpsUrl('http://example.com')).toBe(false)
    expect(isSafeHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeHttpsUrl('not a url')).toBe(false)
  })
})

describe('formatBytes', () => {
  it('formats kilobytes and megabytes', () => {
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(3.5 * 1024 * 1024)).toBe('3.5 MB')
  })
})
