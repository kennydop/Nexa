import { Crown, Lightbulb, ListChecks, Sparkle, X } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

const IDEAS = [
  { icon: Lightbulb, label: 'Explain this page simply' },
  { icon: ListChecks, label: 'Quiz me on this file' },
  { icon: Sparkle, label: 'Summarise in 5 points' },
]

interface Props {
  onClose: () => void
  /** Called before leaving for /plans so the viewer can close. */
  onSeePlans: () => void
}

/** Preview of Premium's study assistant inside the file viewer. Nothing is sent anywhere. */
export function AiTeaserPanel({ onClose, onSeePlans }: Props) {
  return (
    <section
      aria-labelledby="ai-teaser-heading"
      className="pb-safe border-t border-white/10 bg-[#1d1019] px-4 pt-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold">
          <Sparkle size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="ai-teaser-heading" className="flex flex-wrap items-center gap-2 font-bold">
            Study assistant
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[0.7rem] font-bold text-[#2b1a05]">
              <Crown size={12} weight="fill" />
              Premium · coming soon
            </span>
          </h2>
          <p className="mt-1 text-sm text-[#b9a6ae]">Ask questions about this file and get answers that point to the page.</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close study assistant" onClick={onClose} className="text-[#f7eee6] hover:bg-white/10">
          <X size={18} weight="bold" />
        </Button>
      </div>
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {IDEAS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-[#f7eee6]/80">
            <Icon size={16} />
            {label}
          </li>
        ))}
      </ul>
      <Button asChild block className="mt-3 mb-3 bg-gold text-[#2b1a05] hover:bg-gold/90">
        <Link to="/plans" onClick={onSeePlans}>
          See Premium
        </Link>
      </Button>
    </section>
  )
}
