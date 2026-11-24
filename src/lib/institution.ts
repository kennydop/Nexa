import type { AwardLevel, UserRole } from '@/data/types'

export const STUDENT_DOMAIN = 'stu.ucc.edu.gh'
export const STAFF_DOMAIN = 'ucc.edu.gh'

/**
 * Role implied by a UCC address, or null for any other address.
 * Exact domain match only: "x@ucc.edu.gh.evil.com" is not UCC.
 */
export function institutionalRole(email: string): Extract<UserRole, 'student' | 'lecturer'> | null {
  const domain = email.trim().toLowerCase().split('@')[1] ?? ''
  if (domain === STUDENT_DOMAIN) return 'student'
  if (domain === STAFF_DOMAIN) return 'lecturer'
  return null
}

function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Course ids are the slugged course code, e.g. "CSC 101" → "csc-101". */
export function courseIdFromCode(code: string): string {
  return slug(code)
}

/** Programme ids are the slugged name, e.g. "BSc Nursing" → "bsc-nursing". */
export function programIdFromName(name: string): string {
  return slug(name)
}

/** Every level UCC uses: 100–600 for first degrees, 800–900 for postgraduate study. */
export const ALL_LEVELS = [100, 200, 300, 400, 500, 600, 800, 900] as const

const DEFAULT_LEVELS: Record<AwardLevel, number[]> = {
  diploma: [100, 200],
  undergraduate: [100, 200, 300, 400],
  postgraduate: [800],
}

export function defaultLevels(award: AwardLevel): number[] {
  return [...DEFAULT_LEVELS[award]]
}

/** Normalises "csc101", "csc-101" and "CSC  101" to "CSC 101". */
export function normaliseCourseCode(code: string): string {
  const compact = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = compact.match(/^([A-Z]+)(\d+[A-Z]?)$/)
  return match ? `${match[1]} ${match[2]}` : code.trim().toUpperCase()
}
