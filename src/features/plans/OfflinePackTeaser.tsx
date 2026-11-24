import { CloudArrowDown, Lightning } from '@phosphor-icons/react'
import { useState } from 'react'
import { ComingSoonSheet } from './ComingSoonSheet'

/** Shows where Pro's offline course packs will live, on a course's Materials tab. */
export function OfflinePackTeaser() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-[20px] border border-dashed border-line-strong p-3 text-left transition-colors duration-150 hover:border-brand hover:bg-brand-soft/40"
      >
        <CloudArrowDown size={28} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-snug">Save this course for offline</span>
          <span className="block text-sm text-muted">Every material and past question, no data needed</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-ink">
          <Lightning size={12} weight="fill" />
          Pro
        </span>
      </button>
      <ComingSoonSheet plan={open ? 'pro' : null} feature="Offline course packs" onOpenChange={setOpen} />
    </>
  )
}
