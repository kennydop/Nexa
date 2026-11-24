import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { formatCedis, planById, type PlanId } from './plans'

interface Props {
  plan: Exclude<PlanId, 'free'> | null
  /** The perk that led here, e.g. "Offline course packs". */
  feature?: string
  onOpenChange: (open: boolean) => void
  /** Hide the "See all plans" link when already on the Plans page. */
  showPlansLink?: boolean
}

/** Plans are display-only for now: explain that, without pretending to take payment. */
export function ComingSoonSheet({ plan, feature, onOpenChange, showPlansLink = true }: Props) {
  const details = plan ? planById(plan) : null
  return (
    <Sheet
      open={plan !== null}
      onOpenChange={onOpenChange}
      title={details ? `${details.name} is coming soon` : ''}
      description={feature ? `${feature} is part of ${details?.name}.` : details?.tagline}
    >
      {details && (
        <div className="flex flex-col gap-4 pb-6">
          <p className="rounded-2xl bg-surface-2 p-4 text-sm text-muted">
            <span className="block text-2xl font-extrabold text-text">
              {formatCedis(details.semester)}
              <span className="text-base font-bold text-muted"> per semester</span>
            </span>
            or {formatCedis(details.monthly)} a month, paid with Mobile Money or card.
          </p>
          <p className="text-sm text-muted">
            We’re not taking payments yet. Everything you use today, including every material and past question, stays free.
          </p>
          <div className="flex flex-col gap-2">
            {showPlansLink && (
              <Button asChild size="lg" block>
                <Link to="/plans" onClick={() => onOpenChange(false)}>
                  See all plans
                </Link>
              </Button>
            )}
            <Button size="lg" block variant={showPlansLink ? 'ghost' : 'primary'} onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
