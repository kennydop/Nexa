import type { UserRole } from '@/data/types'

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

/** Course ids are the slugged course code, e.g. "CSC 101" → "csc-101". */
export function courseIdFromCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Normalises "csc101", "csc-101" and "CSC  101" to "CSC 101". */
export function normaliseCourseCode(code: string): string {
  const compact = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = compact.match(/^([A-Z]+)(\d+[A-Z]?)$/)
  return match ? `${match[1]} ${match[2]}` : code.trim().toUpperCase()
}
