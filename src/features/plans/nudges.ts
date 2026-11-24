/** How long "Not now" hides an upgrade nudge. */
export const DAY_MS = 24 * 60 * 60 * 1000
export const SNOOZE_MS = 14 * DAY_MS
/** Opening this many files in a day suggests the person is studying hard: offer help. */
export const STUDY_STREAK_OPENS = 3

export type NudgeId = 'home-exam-planner' | 'pq-tracker' | 'saved-offline' | 'materials-offline' | 'viewer-assistant'

export interface NudgeState {
  readonly dismissed: Readonly<Partial<Record<NudgeId, number>>>
  readonly lastInterrupt: number | null
  readonly opens: { readonly day: string; readonly count: number }
}

export const EMPTY_NUDGES: NudgeState = { dismissed: {}, lastInterrupt: null, opens: { day: '', count: 0 } }

const dayKey = (now: number) => new Date(now).toISOString().slice(0, 10)

export function isSnoozed(state: NudgeState, id: NudgeId, now: number): boolean {
  const at = state.dismissed[id]
  return at !== undefined && now - at < SNOOZE_MS
}

export function dismiss(state: NudgeState, id: NudgeId, now: number): NudgeState {
  return { ...state, dismissed: { ...state.dismissed, [id]: now } }
}

export function recordFileOpen(state: NudgeState, now: number): NudgeState {
  const day = dayKey(now)
  const count = state.opens.day === day ? state.opens.count + 1 : 1
  return { ...state, opens: { day, count } }
}

/** Nudges that pop up uninvited are limited to one a day across the whole app. */
export function canInterrupt(state: NudgeState, now: number): boolean {
  return state.lastInterrupt === null || now - state.lastInterrupt >= DAY_MS
}

export function markInterrupted(state: NudgeState, now: number): NudgeState {
  return { ...state, lastInterrupt: now }
}

/** Accepts only well-formed saved state; anything else starts fresh. */
export function parseNudges(raw: string | null): NudgeState {
  if (!raw) return EMPTY_NUDGES
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return EMPTY_NUDGES
    const v = value as Partial<NudgeState>
    const dismissed = typeof v.dismissed === 'object' && v.dismissed !== null ? v.dismissed : {}
    const lastInterrupt = typeof v.lastInterrupt === 'number' ? v.lastInterrupt : null
    const opens =
      v.opens && typeof v.opens.day === 'string' && typeof v.opens.count === 'number' ? v.opens : EMPTY_NUDGES.opens
    return { dismissed, lastInterrupt, opens }
  } catch {
    return EMPTY_NUDGES
  }
}
