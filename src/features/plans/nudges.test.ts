import { describe, expect, it } from 'vitest'
import { EMPTY_NUDGES, canInterrupt, dismiss, isSnoozed, markInterrupted, recordFileOpen, SNOOZE_MS, DAY_MS, parseNudges } from './nudges'

const NOW = Date.UTC(2026, 10, 24, 12)

describe('nudges', () => {
  it('a dismissed nudge stays hidden for the snooze window, then returns', () => {
    const state = dismiss(EMPTY_NUDGES, 'home-exam-planner', NOW)
    expect(isSnoozed(state, 'home-exam-planner', NOW + SNOOZE_MS - 1)).toBe(true)
    expect(isSnoozed(state, 'home-exam-planner', NOW + SNOOZE_MS)).toBe(false)
    expect(isSnoozed(state, 'pq-tracker', NOW)).toBe(false)
  })

  it('does not change the original state', () => {
    dismiss(EMPTY_NUDGES, 'saved-offline', NOW)
    expect(EMPTY_NUDGES.dismissed).toEqual({})
  })

  it('counts file opens per day and resets on a new day', () => {
    let state = recordFileOpen(EMPTY_NUDGES, NOW)
    state = recordFileOpen(state, NOW + 1000)
    expect(state.opens.count).toBe(2)
    state = recordFileOpen(state, NOW + DAY_MS)
    expect(state.opens.count).toBe(1)
  })

  it('allows at most one interrupting nudge a day', () => {
    expect(canInterrupt(EMPTY_NUDGES, NOW)).toBe(true)
    const shown = markInterrupted(EMPTY_NUDGES, NOW)
    expect(canInterrupt(shown, NOW + DAY_MS - 1)).toBe(false)
    expect(canInterrupt(shown, NOW + DAY_MS)).toBe(true)
  })
})

describe('parseNudges', () => {
  it('falls back to empty state for missing or corrupt storage', () => {
    expect(parseNudges(null)).toEqual(EMPTY_NUDGES)
    expect(parseNudges('{not json')).toEqual(EMPTY_NUDGES)
    expect(parseNudges('42')).toEqual(EMPTY_NUDGES)
  })

  it('keeps valid saved state', () => {
    const saved = dismiss(EMPTY_NUDGES, 'pq-tracker', NOW)
    expect(parseNudges(JSON.stringify(saved))).toEqual(saved)
  })
})
