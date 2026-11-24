import { formatCedis, PLANS, priceFor, semesterSavingPercent } from './plans'

describe('plans', () => {
  it('lists Free, Pro and Premium in order, Free costing nothing', () => {
    expect(PLANS.map((p) => p.id)).toEqual(['free', 'pro', 'premium'])
    expect(priceFor(PLANS[0], 'monthly')).toBe(0)
    expect(priceFor(PLANS[0], 'semester')).toBe(0)
  })

  it('prices Pro and Premium in cedis per month and per semester pass', () => {
    const [, pro, premium] = PLANS
    expect([priceFor(pro, 'monthly'), priceFor(pro, 'semester')]).toEqual([15, 45])
    expect([priceFor(premium, 'monthly'), priceFor(premium, 'semester')]).toEqual([35, 99])
  })

  it('works out the semester saving against four monthly payments', () => {
    const [, pro, premium] = PLANS
    expect(semesterSavingPercent(pro)).toBe(25)
    expect(semesterSavingPercent(premium)).toBe(29)
  })

  it('formats cedi amounts the Ghanaian way', () => {
    expect(formatCedis(0)).toBe('Free')
    expect(formatCedis(45)).toBe('GH₵45')
  })
})
