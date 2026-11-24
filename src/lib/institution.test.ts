import { describe, expect, it } from 'vitest'
import { courseIdFromCode, institutionalRole, normaliseCourseCode, defaultLevels, programIdFromName } from './institution'

describe('institutionalRole', () => {
  it('maps student and staff domains', () => {
    expect(institutionalRole('kofi.mensah@stu.ucc.edu.gh')).toBe('student')
    expect(institutionalRole('E.Boateng@UCC.EDU.GH')).toBe('lecturer')
  })
  it('rejects look-alike and other domains', () => {
    expect(institutionalRole('x@ucc.edu.gh.evil.com')).toBeNull()
    expect(institutionalRole('x@notucc.edu.gh')).toBeNull()
    expect(institutionalRole('x@gmail.com')).toBeNull()
    expect(institutionalRole('no-at-sign')).toBeNull()
  })
})

describe('course codes', () => {
  it('normalises user-typed codes', () => {
    expect(normaliseCourseCode('csc101')).toBe('CSC 101')
    expect(normaliseCourseCode(' asp-148b ')).toBe('ASP 148B')
  })
  it('derives ids that match the catalogue', () => {
    expect(courseIdFromCode('CSC 101')).toBe('csc-101')
    expect(courseIdFromCode('ASP 148B')).toBe('asp-148b')
  })
})

describe('programIdFromName', () => {
  it('slugs the programme name like the catalogue ids', () => {
    expect(programIdFromName('BSc Computer Engineering')).toBe('bsc-computer-engineering')
    expect(programIdFromName('  MPhil (Mathematics Education) ')).toBe('mphil-mathematics-education')
  })
})

describe('defaultLevels', () => {
  it('matches how UCC numbers its levels', () => {
    expect(defaultLevels('undergraduate')).toEqual([100, 200, 300, 400])
    expect(defaultLevels('diploma')).toEqual([100, 200])
    expect(defaultLevels('postgraduate')).toEqual([800])
  })
})
