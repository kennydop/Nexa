import { CaretRight, Lightning } from '@phosphor-icons/react'
import { Link } from 'react-router'

/** "Your plan" entry on the Me tab. Everyone is on Free until plans launch. */
export function YourPlanCard() {
  return (
    <Link
      to="/plans"
      className="group flex items-center gap-4 rounded-[24px] border border-line bg-surface p-4 transition-[border-color,transform] duration-150 hover:border-brand active:scale-[0.98]"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Lightning size={26} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-muted">Your plan</span>
        <span className="block font-bold">Free</span>
        <span className="block text-sm text-brand">See Pro and Premium</span>
      </span>
      <CaretRight size={18} weight="bold" className="text-faint transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  )
}
