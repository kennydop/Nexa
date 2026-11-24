/*
 * Nexa plans. Display only for now: no payments are taken and nothing is
 * gated. Course content (materials, past questions, discussions) stays free.
 */
export type PlanId = 'free' | 'pro' | 'premium'
export type Billing = 'monthly' | 'semester'

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  /** Price in Ghana cedis. */
  monthly: number
  semester: number
  /** Short headline perks shown on the plan card. */
  features: string[]
  /** "Everything in X, plus" line above the features. */
  includes?: string
}

export const MONTHS_PER_SEMESTER = 4

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need to study, for everyone.',
    monthly: 0,
    semester: 0,
    features: [
      'Every programme, course and level',
      'All materials and past questions',
      'Course discussions, ratings and votes',
      'Upload and share notes',
      'Save courses and read opened files offline',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Study smarter and spend less on data.',
    monthly: 15,
    semester: 45,
    includes: 'Everything in Free, plus',
    features: [
      'Offline course packs: a whole course in one tap',
      'Data saver: lighter PDFs and images',
      'Exam planner with countdowns and reminders',
      'Private notes and highlights on any PDF',
      'Past-question tracker',
      'Pro badge on your posts',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Help the moment you’re stuck.',
    monthly: 35,
    semester: 99,
    includes: 'Everything in Pro, plus',
    features: [
      'AI study assistant: explains past questions step by step',
      'Summaries and practice questions from course materials',
      'Verified worked solutions from lecturers and top students',
      'Priority answers in course discussions',
    ],
  },
]

export const planById = (id: PlanId): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0]

export function priceFor(plan: Plan, billing: Billing): number {
  return billing === 'monthly' ? plan.monthly : plan.semester
}

/** How much a semester pass saves against paying monthly for the same four months. */
export function semesterSavingPercent(plan: Plan): number {
  const monthlyTotal = plan.monthly * MONTHS_PER_SEMESTER
  if (monthlyTotal === 0) return 0
  return Math.round(((monthlyTotal - plan.semester) / monthlyTotal) * 100)
}

export function formatCedis(amount: number): string {
  return amount === 0 ? 'Free' : `GH₵${amount}`
}
