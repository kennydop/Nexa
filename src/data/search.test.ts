import { describe, expect, it } from 'vitest'
import { searchCourses, searchPrograms } from './search'
import type { Course, Program } from './types'

const course = (code: string, title: string): Course => ({
  id: code,
  code,
  title,
  creditHours: 3,
  description: null,
})

const COURSES = [
  course('CSC 101', 'Introduction to Computing'),
  course('CSC 102', 'Programming Fundamentals'),
  course('ACF 201', 'Financial Accounting'),
  course('MAT 101', 'Algebra and Trigonometry'),
]

describe('searchCourses', () => {
  it('finds a course by its code regardless of spacing or case', () => {
    expect(searchCourses(COURSES, 'csc101').map((c) => c.code)).toEqual(['CSC 101'])
    expect(searchCourses(COURSES, 'CSC 101')[0].code).toBe('CSC 101')
  })

  it('ranks an exact code before code-prefix matches', () => {
    const codes = searchCourses(COURSES, 'csc').map((c) => c.code)
    expect(codes).toEqual(['CSC 101', 'CSC 102'])
  })

  it('matches every word of a title query in any order', () => {
    expect(searchCourses(COURSES, 'accounting financial').map((c) => c.code)).toEqual(['ACF 201'])
  })

  it('returns nothing for queries shorter than two characters', () => {
    expect(searchCourses(COURSES, 'c')).toEqual([])
  })
})

describe('searchPrograms', () => {
  const program = (name: string, degree: string): Program => ({
    id: name,
    departmentId: 'd',
    collegeId: 'c',
    name,
    degree,
    awardLevel: 'undergraduate',
    levels: [100, 200, 300, 400],
  })

  it('matches on programme name and degree', () => {
    const programs = [program('Computer Science', 'BSc'), program('Economics', 'BA')]
    expect(searchPrograms(programs, 'bsc computer').map((p) => p.name)).toEqual(['Computer Science'])
  })
})
