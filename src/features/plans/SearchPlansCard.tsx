import { ArrowRight, Crown, Lightning, X, type Icon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context'
import { cn } from '@/lib/utils'
import { formatCedis, planById, type PlanId } from './plans'
import { useNudge } from './useNudges'

interface Tile {
  id: Exclude<PlanId, 'free'>
  icon: Icon
  perks: string
  className: string
  iconClass: string
}

const TILES: Tile[] = [
  {
    id: 'pro',
    icon: Lightning,
    perks: 'Offline course packs, exam planner, past-question tracker',
    className: 'bg-white/8 hover:bg-white/12',
    iconClass: 'text-brand',
  },
  {
    id: 'premium',
    icon: Crown,
    perks: 'AI study assistant and worked solutions',
    className: 'bg-gold/15 ring-1 ring-gold/40 hover:bg-gold/20',
    iconClass: 'text-gold',
  },
]

/** The big plans showcase on Search before anything is typed. Signed-in people only; "Not now" hides it for two weeks. */
export function SearchPlansCard() {
  const { userId } = useAuth()
  const { visible, snooze } = useNudge('search-plans')
  if (!userId || !visible) return null

  return (
    <section
      aria-labelledby="search-plans-heading"
      className="relative overflow-hidden rounded-[32px] bg-plum p-5 pt-6 text-[#f7eee6] shadow-card"
    >
      <span aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-ember/25 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 size-44 rounded-full border border-white/10" />
      <span aria-hidden className="pointer-events-none absolute top-6 right-6 size-20 rounded-full border border-white/15" />

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss plans"
        onClick={snooze}
        className="absolute top-3 right-3 text-[#f7eee6] hover:bg-white/10"
      >
        <X size={16} weight="bold" />
      </Button>

      <div className="relative">
        <p className="text-xs font-bold tracking-wider text-gold uppercase">Nexa Pro and Premium</p>
        <h2 id="search-plans-heading" className="mt-2 pr-10 text-[1.75rem] leading-[1.1] font-extrabold tracking-tight">
          Found your course? Study it faster.
        </h2>
        <p className="mt-2 text-sm text-[#f7eee6]/75">
          Course content stays free. Paid plans add tools that save you time and data.
        </p>

        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {TILES.map(({ id, icon: TileIcon, perks, className, iconClass }) => {
            const plan = planById(id)
            return (
              <li key={id}>
                <Link
                  to="/plans"
                  className={cn(
                    'flex h-full flex-col rounded-[22px] p-3.5 transition-[background-color,transform] duration-150 active:scale-[0.97]',
                    className,
                  )}
                >
                  <TileIcon size={26} weight="fill" className={iconClass} />
                  <span className="mt-2 font-extrabold">{plan.name}</span>
                  <span className="text-2xl leading-tight font-extrabold tabular-nums">{formatCedis(plan.semester)}</span>
                  <span className="text-xs font-bold text-[#f7eee6]/65">per semester</span>
                  <span className="mt-2 text-xs leading-snug text-[#f7eee6]/75">{perks}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild block className="bg-gold text-[#2b1a05] shadow-none hover:bg-gold/90">
            <Link to="/plans">
              Compare plans
              <ArrowRight size={18} weight="bold" />
            </Link>
          </Button>
          <Button variant="ghost" onClick={snooze} className="shrink-0 text-[#f7eee6] hover:bg-white/10">
            Not now
          </Button>
        </div>
      </div>
    </section>
  )
}
