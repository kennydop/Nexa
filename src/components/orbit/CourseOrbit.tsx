import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { Course } from '@/data/types'
import { MOON_BG } from '@/lib/academic'
import { cn } from '@/lib/utils'
import { layoutMoons } from './layout'
import './orbit.css'

interface CourseOrbitProps {
  courses: Course[]
  sunLabel: string
  sunCaption: string
  onSunPress?: () => void
  sunHint?: string
}

export function CourseOrbit({ courses, sunLabel, sunCaption, onSunPress, sunHint }: CourseOrbitProps) {
  const reduceMotion = useReducedMotion()
  const moons = layoutMoons(courses)
  const hasOuter = moons.some((m) => m.ring === 1)

  return (
    <div className={cn('orbit relative mx-auto aspect-square w-full max-w-[22rem]', reduceMotion && 'orbit-still')}>
      {/* rings */}
      <div aria-hidden className="orbit-ring absolute inset-[24%] rounded-full" />
      {hasOuter && <div aria-hidden className="orbit-ring absolute inset-[10%] rounded-full" />}

      {[0, 1].map((ring) => (
        <ul
          key={ring}
          className={cn('orbit-track absolute inset-0', ring === 1 && 'orbit-track--outer')}
          aria-label={ring === 0 ? 'Courses this semester' : undefined}
        >
          {moons
            .filter((m) => m.ring === ring)
            .map((moon, i) => (
              <li
                key={moon.course.id}
                className="orbit-slot absolute top-1/2 left-1/2"
                style={
                  {
                    '--angle': `${moon.angle}deg`,
                    '--radius': ring === 0 ? '26cqw' : '40cqw',
                  } as CSSProperties
                }
              >
                <div className="orbit-moon-upright">
                <motion.div
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06 + ring * 0.2, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Link
                    to={`/course/${moon.course.id}`}
                    aria-label={`${moon.course.code}: ${moon.course.title}`}
                    className={cn(
                      'grid place-items-center rounded-full text-center font-display leading-none font-extrabold text-[#1a0e16] shadow-[0_10px_24px_-10px_rgb(0_0_0/0.6)] ring-4 ring-bg transition-transform duration-200 hover:scale-110 active:scale-95',
                      MOON_BG[moon.color],
                    )}
                    style={{ width: moon.size, height: moon.size, fontSize: moon.size / 5.2 }}
                  >
                    <span className="px-1">
                      {moon.course.code.split(' ')[0]}
                      <br />
                      <span className="opacity-70">{moon.course.code.split(' ')[1]}</span>
                    </span>
                  </Link>
                </motion.div>
                </div>
              </li>
            ))}
        </ul>
      ))}

      {/* sun */}
      <motion.button
        type="button"
        onClick={onSunPress}
        disabled={!onSunPress}
        aria-label={sunHint}
        whileTap={{ scale: 0.94 }}
        className="orbit-sun absolute top-1/2 left-1/2 grid size-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center text-[#1a0e16]"
      >
        <span>
          <span className="block font-display text-2xl leading-none font-extrabold">{sunLabel}</span>
          <span className="mt-1 block text-[0.7rem] font-bold tracking-wide uppercase opacity-75">{sunCaption}</span>
        </span>
      </motion.button>
    </div>
  )
}
