import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MenuAction {
  label: string
  icon: Icon
  onSelect: () => void
  tone?: 'default' | 'danger'
  hidden?: boolean
}

interface MenuProps {
  trigger: ReactNode
  actions: MenuAction[]
  label: string
}

/** Accessible overflow menu (keyboard, focus and dismissal handled by Radix). */
export function Menu({ trigger, actions, label }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild aria-label={label}>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-[60] min-w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-float"
        >
          {actions
            .filter((a) => !a.hidden)
            .map(({ label: text, icon: IconCmp, onSelect, tone }) => (
              <DropdownMenu.Item
                key={text}
                onSelect={onSelect}
                className={cn(
                  'flex h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-[0.95rem] font-semibold outline-none data-[highlighted]:bg-surface-2',
                  tone === 'danger' && 'text-danger',
                )}
              >
                <IconCmp size={20} />
                {text}
              </DropdownMenu.Item>
            ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
