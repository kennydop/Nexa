import { Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const STARS = [1, 2, 3, 4, 5]

interface StarRatingProps {
  value: number | null
  onChange?: (value: number | null) => void
  size?: number
  className?: string
}

/** Read-only when no onChange is given; tapping the current value clears it. */
export function StarRating({ value, onChange, size = 18, className }: StarRatingProps) {
  if (!onChange) {
    return (
      <span className={cn('inline-flex gap-0.5 text-gold', className)} aria-label={`${value ?? 0} out of 5`}>
        {STARS.map((n) => (
          <Star key={n} size={size} weight={value && n <= Math.round(value) ? 'fill' : 'duotone'} />
        ))}
      </span>
    )
  }
  return (
    <div role="radiogroup" aria-label="Rate this course" className={cn('inline-flex gap-1', className)}>
      {STARS.map((n) => {
        const filled = value !== null && n <= value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              'grid size-10 place-items-center rounded-full transition-transform duration-150 active:scale-90',
              filled ? 'text-gold' : 'text-faint hover:text-muted',
            )}
          >
            <Star size={size} weight={filled ? 'fill' : 'duotone'} />
          </button>
        )
      })}
    </div>
  )
}
