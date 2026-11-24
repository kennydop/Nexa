import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-line', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative flex h-12 shrink-0 items-center gap-1.5 px-2.5 text-[0.92rem] font-bold text-muted transition-colors duration-150',
        'after:absolute after:inset-x-3 after:bottom-[-1px] after:h-[3px] after:origin-center after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 after:ease-[var(--ease-out-expo)]',
        'hover:text-text data-[state=active]:text-text data-[state=active]:after:scale-x-100',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-5 focus-visible:outline-none', className)} {...props} />
}
