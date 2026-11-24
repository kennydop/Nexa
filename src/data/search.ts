import type { Course, Program } from './types'

const MAX_RESULTS = 20

export function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Matches "csc101", "CSC 101" and "csc-101" against the code "CSC 101". */
function compactCode(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term))
}

export function searchCourses(courses: Course[], query: string): Course[] {
  const q = normalise(query)
  if (q.length < 2) return []
  const terms = q.split(' ')
  const code = compactCode(q)
  const scored = courses
    .map((course) => {
      const courseCode = compactCode(course.code)
      const title = normalise(course.title)
      if (courseCode === code) return { course, score: 3 }
      if (code.length >= 3 && courseCode.startsWith(code)) return { course, score: 2 }
      if (matchesAllTerms(`${title} ${normalise(course.code)}`, terms)) return { course, score: 1 }
      return null
    })
    .filter((hit): hit is { course: Course; score: number } => hit !== null)
  return [...scored]
    .sort((a, b) => b.score - a.score || a.course.code.localeCompare(b.course.code))
    .slice(0, MAX_RESULTS)
    .map((hit) => hit.course)
}

export function searchPrograms(programs: Program[], query: string): Program[] {
  const q = normalise(query)
  if (q.length < 2) return []
  const terms = q.split(' ')
  return programs
    .filter((program) => matchesAllTerms(normalise(`${program.name} ${program.degree}`), terms))
    .slice(0, MAX_RESULTS)
}
