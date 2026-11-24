import { Sparkle, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { nudgeStore } from './useNudges'

interface Props {
  onTry: () => void
  onDismiss: () => void
}

/** A one-a-day hint in the viewer, shown after a few files have been opened that day. */
export function AssistantCallout({ onTry, onDismiss }: Props) {
  return (
    <aside
      aria-label="Premium suggestion"
      className="flex items-center gap-3 border-b border-white/10 bg-gold/10 px-4 py-2.5 text-sm"
    >
      <Sparkle size={20} weight="fill" className="shrink-0 text-gold" />
      <p className="min-w-0 flex-1 text-[#f7eee6]">
        <span className="font-bold">Studying hard today?</span> Premium can explain this.
      </p>
      <Button size="sm" onClick={onTry} className="bg-gold text-[#2b1a05] shadow-none hover:bg-gold/90">
        Show me
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss suggestion"
        onClick={() => {
          nudgeStore.snooze('viewer-assistant')
          onDismiss()
        }}
        className="text-[#f7eee6] hover:bg-white/10"
      >
        <X size={16} weight="bold" />
      </Button>
    </aside>
  )
}
