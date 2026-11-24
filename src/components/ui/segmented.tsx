import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { motion } from 'motion/react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  label: string
  className?: string
}

/** Single-choice pill switcher with a sliding thumb. */
export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  const thumbId = useId()
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
      className={cn('flex rounded-full bg-surface-2 p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className={cn(
              'relative h-9 flex-1 rounded-full px-3 text-sm font-bold transition-colors duration-150',
              active ? 'text-brand-ink' : 'text-muted hover:text-text',
            )}
          >
            {active && (
              <motion.span
                layoutId={thumbId}
                className="absolute inset-0 rounded-full bg-brand"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </ToggleGroup.Item>
        )
      })}
    </ToggleGroup.Root>
  )
}
