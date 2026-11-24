import * as SelectPrimitive from '@radix-ui/react-select'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function Select({ id, value, onChange, options, placeholder, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-2xl border border-line bg-surface-2 px-4 text-left text-[0.95rem] data-[placeholder]:text-faint focus:border-brand focus:outline-none',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <CaretDown size={18} className="text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[60] max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-line bg-surface shadow-float"
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex h-11 cursor-pointer items-center justify-between rounded-xl px-3 text-[0.95rem] outline-none data-[highlighted]:bg-surface-2"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={16} weight="bold" className="text-brand" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
