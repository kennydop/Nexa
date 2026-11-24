import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: Icon
  title: string
  body: string
  action?: ReactNode
}

export function EmptyState({ icon: IconCmp, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-[22px] bg-brand-soft text-brand">
        <IconCmp size={32} />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
