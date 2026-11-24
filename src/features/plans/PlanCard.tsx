import { CheckCircle, Crown, Lightning, Sparkle, type Icon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCedis, priceFor, semesterSavingPercent, type Billing, type Plan, type PlanId } from './plans'

const LOOK: Record<PlanId, { icon: Icon; card: string; muted: string; tick: string; chip?: string }> = {
  free: { icon: Sparkle, card: 'border border-line bg-surface', muted: 'text-muted', tick: 'text-success' },
  pro: {
    icon: Lightning,
    card: 'border-2 border-brand bg-surface',
    muted: 'text-muted',
    tick: 'text-brand',
    chip: 'bg-brand text-brand-ink',
  },
  premium: {
    icon: Crown,
    card: 'relative overflow-hidden bg-plum text-[#f7eee6]',
    muted: 'text-[#f7eee6]/70',
    tick: 'text-gold',
    chip: 'bg-gold text-[#2b1a05]',
  },
}

interface Props {
  plan: Plan
  billing: Billing
  isCurrent: boolean
  badge?: string
  onChoose: (plan: Plan) => void
}

export function PlanCard({ plan, billing, isCurrent, badge, onChoose }: Props) {
  const look = LOOK[plan.id]
  const price = priceFor(plan, billing)
  const saving = semesterSavingPercent(plan)
  const headingId = `plan-${plan.id}`

  return (
    <article aria-labelledby={headingId} className={cn('rounded-[28px] p-5 shadow-card', look.card)}>
      {plan.id === 'premium' && (
        <>
          <span aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-ember/25 blur-2xl" />
          <span aria-hidden className="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full border border-white/15" />
        </>
      )}
      <div className="relative">
        <div className="flex items-center gap-2">
          <look.icon size={26} className={plan.id === 'free' ? 'text-brand' : look.tick} weight="duotone" />
          <h2 id={headingId} className="text-xl font-extrabold">
            {plan.name}
          </h2>
          {badge && <span className={cn('ml-auto rounded-full px-2.5 py-1 text-xs font-bold', look.chip ?? 'bg-surface-2 text-muted')}>{badge}</span>}
        </div>
        <p className={cn('mt-1 text-sm', look.muted)}>{plan.tagline}</p>

        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-[2.6rem] leading-none font-extrabold tracking-tight tabular-nums">{price === 0 ? 'GH₵0' : formatCedis(price)}</span>
          {price > 0 && <span className={cn('font-bold', look.muted)}>/ {billing === 'monthly' ? 'month' : 'semester'}</span>}
        </p>
        <p className={cn('mt-1 h-5 text-sm', look.muted)}>
          {price === 0
            ? 'No card, no Mobile Money needed'
            : billing === 'semester'
              ? `${formatCedis(plan.monthly)} a month if you pay monthly · save ${saving}%`
              : `or ${formatCedis(plan.semester)} for a whole semester`}
        </p>

        {plan.includes && <p className="mt-5 text-sm font-bold">{plan.includes}</p>}
        <ul className={cn('flex flex-col gap-2.5', plan.includes ? 'mt-2.5' : 'mt-5')}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[0.95rem] leading-snug">
              <CheckCircle size={20} weight="fill" className={cn('mt-px shrink-0', look.tick)} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {isCurrent ? (
            <p className={cn('rounded-2xl py-3 text-center text-sm font-bold', plan.id === 'premium' ? 'bg-white/10' : 'bg-surface-2 text-muted')}>
              Your current plan
            </p>
          ) : plan.id === 'free' ? null : (
            <Button
              size="lg"
              block
              onClick={() => onChoose(plan)}
              className={plan.id === 'premium' ? 'bg-gold text-[#2b1a05] hover:bg-gold/90' : undefined}
            >
              Get {plan.name}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
