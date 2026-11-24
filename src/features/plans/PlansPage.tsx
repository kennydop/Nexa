import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Segmented } from '@/components/ui/segmented'
import { useAuth } from '@/features/auth/context'
import { ComingSoonSheet } from './ComingSoonSheet'
import { PlanCard } from './PlanCard'
import { PLANS, semesterSavingPercent, type Billing, type PlanId } from './plans'

const BEST_SAVING = Math.max(...PLANS.map(semesterSavingPercent))

const FAQ = [
  {
    q: 'Will materials and past questions stay free?',
    a: 'Yes. Everything students share on Nexa stays free for everyone. Plans add study tools on top.',
  },
  {
    q: 'How will I pay?',
    a: 'With Mobile Money or a card. A semester pass is a single payment that covers the whole semester.',
  },
  {
    q: 'Can I use Nexa without a plan?',
    a: 'Of course. Free has every programme, course, file and discussion, and it always will.',
  },
]

export function PlansPage() {
  const { profile } = useAuth()
  const [params, setParams] = useSearchParams()
  const billing: Billing = params.get('billing') === 'monthly' ? 'monthly' : 'semester'
  const [chosen, setChosen] = useState<Exclude<PlanId, 'free'> | null>(null)

  return (
    <>
      <PageHeader title="Plans" />
      <section aria-labelledby="plans-heading" className="mb-6">
        <h1 id="plans-heading" className="text-[2.1rem] leading-[1.05] font-extrabold tracking-tight">
          Free to learn.
          <br />
          <span className="text-brand">Faster with Pro.</span>
        </h1>
        <p className="mt-3 text-muted">
          Every material, past question and discussion is free for everyone. Pro and Premium add tools that save you time
          and data.
        </p>
      </section>

      <div className="mb-5 flex flex-col gap-2">
        <Segmented
          label="Billing"
          value={billing}
          onChange={(next) => setParams(next === 'semester' ? {} : { billing: next }, { replace: true })}
          options={[
            { value: 'semester', label: 'Semester pass' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
        <p className="text-center text-xs font-bold text-success">Semester passes save up to {BEST_SAVING}%</p>
      </div>

      <div className="flex flex-col gap-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            isCurrent={plan.id === 'free' && Boolean(profile)}
            badge={plan.id === 'pro' ? 'Popular' : plan.id === 'premium' ? 'Most help' : profile ? undefined : 'Free forever'}
            onChoose={(p) => p.id !== 'free' && setChosen(p.id)}
          />
        ))}
      </div>

      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="text-sm font-bold tracking-wider text-faint uppercase">
          Questions
        </h2>
        <dl className="mt-3 divide-y divide-line rounded-[24px] border border-line bg-surface">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="p-4">
              <dt className="font-bold">{q}</dt>
              <dd className="mt-1 text-sm text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ComingSoonSheet plan={chosen} onOpenChange={(open) => !open && setChosen(null)} showPlansLink={false} />
    </>
  )
}
