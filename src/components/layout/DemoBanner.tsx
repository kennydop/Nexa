import { Flask } from '@phosphor-icons/react'
import { backend } from '@/data/backend'

/** Makes it obvious that nothing is being saved to a server. */
export function DemoBanner() {
  if (backend.repo.mode !== 'demo') return null
  return (
    <div className="pt-safe flex items-center justify-center gap-2 bg-plum px-4 pb-1.5 text-center text-xs font-semibold text-[#f7eee6]">
      <Flask size={14} />
      Demo mode · your posts stay on this device
    </div>
  )
}
