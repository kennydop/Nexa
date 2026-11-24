import { CaretRight } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { Course } from '@/data/types'
import { cn } from '@/lib/utils'

interface CourseRowProps {
  course: Course
  accent?: string
  meta?: string
}

export function CourseRow({ course, accent = 'bg-brand', meta }: CourseRowProps) {
  const [prefix, number] = course.code.split(' ')
  return (
    <Link
      to={`/course/${course.id}`}
      className="group flex items-center gap-4 rounded-[20px] p-2 pr-3 transition-colors duration-150 hover:bg-surface-2 active:bg-surface-3"
    >
      <span
        className={cn(
          'grid size-14 shrink-0 place-items-center rounded-[18px] text-center font-display leading-none font-extrabold text-[#1a0e16]',
          accent,
        )}
      >
        <span className="text-[0.7rem]">
          {prefix}
          <span className="block text-lg">{number}</span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-bold leading-snug">{course.title}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {meta ?? (course.creditHours ? `${course.creditHours} credit hours` : course.code)}
        </span>
      </span>
      <CaretRight
        size={18}
        weight="bold"
        className="shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </Link>
  )
}
