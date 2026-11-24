import { Crown, Lightning, X, type Icon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context'
import { cn } from '@/lib/utils'
import type { NudgeId } from './nudges'
import { useNudge } from './useNudges'

interface Props {
  id: NudgeId
  plan: 'pro' | 'premium'
  icon: Icon
  title: string
  body: string
  className?: string
}

/**
 * An upgrade suggestion placed where the paid feature would help.
 * Only signed-in people see it (guests are asked to sign up first) and "Not now" hides it for two weeks.
 */
export function NudgeCard({ id, plan, icon: FeatureIcon, title, body, className }: Props) {
  const { userId } = useAuth()
  const { visible, snooze } = useNudge(id)
  if (!userId || !visible) return null

  const premium = plan === 'premium'
  const PlanIcon = premium ? Crown : Lightning
  return (
    <aside
      aria-label={`${premium ? 'Premium' : 'Pro'} suggestion`}
      className={cn(
        'relative flex gap-3 overflow-hidden rounded-[24px] p-4',
        premium ? 'bg-plum text-[#f7eee6]' : 'border border-brand/30 bg-brand-soft',
        className,
      )}
    >
      <FeatureIcon size={30} className={cn('mt-0.5 shrink-0', premium ? 'text-gold' : 'text-brand')} />
      <div className="min-w-0 flex-1">
        <p className="pr-8 font-bold leading-snug">{title}</p>
        <p className={cn('mt-1 text-sm', premium ? 'text-[#f7eee6]/75' : 'text-muted')}>{body}</p>
        <div className="mt-3 flex items-center gap-2">
          <Button asChild size="sm" className={premium ? 'bg-gold text-[#2b1a05] shadow-none hover:bg-gold/90' : undefined}>
            <Link to="/plans">
              <PlanIcon size={16} weight="fill" />
              See {premium ? 'Premium' : 'Pro'}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={snooze} className={premium ? 'text-[#f7eee6] hover:bg-white/10' : undefined}>
            Not now
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss suggestion"
        onClick={snooze}
        className={cn('absolute top-2 right-2', premium && 'text-[#f7eee6] hover:bg-white/10')}
      >
        <X size={16} weight="bold" />
      </Button>
    </aside>
  )
}
