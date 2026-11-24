import type { Course, MoonColor } from '@/data/types'

const MOON_COLORS: MoonColor[] = ['ember', 'sky', 'lime', 'violet', 'gold', 'mint', 'rose']
const INNER_RING_CAPACITY = 4
const BASE_MOON = 42
const MOON_PER_CREDIT = 4

export interface Moon {
  course: Course
  ring: 0 | 1
  angle: number
  size: number
  color: MoonColor
}

/** Spreads courses over two rings; bigger moons for heavier courses. */
export function layoutMoons(courses: Course[]): Moon[] {
  const inner = courses.slice(0, INNER_RING_CAPACITY)
  const outer = courses.slice(INNER_RING_CAPACITY)
  const place = (list: Course[], ring: 0 | 1, offset: number, startIndex: number): Moon[] =>
    list.map((course, i) => ({
      course,
      ring,
      angle: offset + (360 / list.length) * i,
      size: BASE_MOON + Math.min(course.creditHours ?? 3, 4) * MOON_PER_CREDIT,
      color: MOON_COLORS[(startIndex + i) % MOON_COLORS.length],
    }))
  return [...place(inner, 0, -90, 0), ...place(outer, 1, -60, inner.length)]
}

