import { describe, expect, it } from 'vitest'
import { coursesFor, currentSemester, totalCredits } from './academic'
import type { CurriculumEntry } from '@/data/types'

const entry = (code: string, level: number, semester: 1 | 2, credits: number | null = 3): CurriculumEntry => ({
  level,
  semester,
  course: { id: code, code, title: code, creditHours: credits, description: null },
})

describe('currentSemester', () => {
  it('is the first semester from August to December', () => {
    expect(currentSemester(new Date(2026, 7, 1))).toBe(1)
    expect(currentSemester(new Date(2026, 10, 24))).toBe(1)
  })
  it('is the second semester from January to July', () => {
    expect(currentSemester(new Date(2027, 0, 10))).toBe(2)
    expect(currentSemester(new Date(2027, 6, 30))).toBe(2)
  })
})

describe('coursesFor', () => {
  it('keeps only the requested level and semester, sorted by code', () => {
    const list = [entry('CSC 103', 100, 1), entry('CSC 101', 100, 1), entry('CSC 102', 100, 2), entry('CSC 201', 200, 1)]
    expect(coursesFor(list, 100, 1).map((e) => e.course.code)).toEqual(['CSC 101', 'CSC 103'])
  })
})

describe('totalCredits', () => {
  it('sums credit hours and treats unknown credits as zero', () => {
    expect(totalCredits([entry('A', 100, 1, 3), entry('B', 100, 1, null), entry('C', 100, 1, 2)])).toBe(5)
  })
})
