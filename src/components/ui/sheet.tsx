import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** Native-feeling bottom sheet with drag-to-dismiss. */
export function Sheet({ open, onOpenChange, title, description, children, className }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-lg flex-col rounded-t-[28px] border-t border-line bg-surface outline-none',
            className,
          )}
        >
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-11 rounded-full bg-line-strong" />
          <header className="px-6 pt-4 pb-2">
            <Drawer.Title className="font-display text-2xl font-bold">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-sm text-muted">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </header>
          <div className="pb-safe overflow-y-auto px-6 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
