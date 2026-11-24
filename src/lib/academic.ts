import type { CurriculumEntry, MoonColor } from '@/data/types'

/** UCC's first semester runs roughly August–December; second January–July. */
export function currentSemester(date: Date = new Date()): 1 | 2 {
  return date.getMonth() >= 7 ? 1 : 2
}

export function levelLabel(level: number): string {
  return level >= 800 ? `Level ${level} (PG)` : `Level ${level}`
}

export function coursesFor(entries: CurriculumEntry[], level: number, semester: 1 | 2): CurriculumEntry[] {
  return entries
    .filter((entry) => entry.level === level && entry.semester === semester)
    .sort((a, b) => a.course.code.localeCompare(b.course.code))
}

export function totalCredits(entries: CurriculumEntry[]): number {
  return entries.reduce((sum, entry) => sum + (entry.course.creditHours ?? 0), 0)
}

export const MOON_TEXT: Record<MoonColor, string> = {
  ember: 'text-ember',
  lime: 'text-lime',
  sky: 'text-sky',
  violet: 'text-violet',
  rose: 'text-rose',
  gold: 'text-gold',
  mint: 'text-mint',
}

export const MOON_BG: Record<MoonColor, string> = {
  ember: 'bg-ember',
  lime: 'bg-lime',
  sky: 'bg-sky',
  violet: 'bg-violet',
  rose: 'bg-rose',
  gold: 'bg-gold',
  mint: 'bg-mint',
}
