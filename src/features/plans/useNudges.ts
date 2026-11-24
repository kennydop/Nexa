import { useCallback, useState, useSyncExternalStore } from 'react'
import {
  STUDY_STREAK_OPENS,
  canInterrupt,
  dismiss,
  isSnoozed,
  markInterrupted,
  parseNudges,
  recordFileOpen,
  type NudgeId,
  type NudgeState,
} from './nudges'

const KEY = 'nexa.nudges'
const listeners = new Set<() => void>()

function read(): NudgeState {
  try {
    return parseNudges(localStorage.getItem(KEY))
  } catch {
    return parseNudges(null)
  }
}

let current: NudgeState = read()

function write(next: NudgeState) {
  current = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private mode or storage blocked: nudges just won't be remembered.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const snapshot = () => current

export const nudgeStore = {
  /** True (and uses up today's slot) when an uninvited nudge may show now. */
  claimInterrupt: (): boolean => {
    const now = Date.now()
    if (!canInterrupt(current, now)) return false
    write(markInterrupted(current, now))
    return true
  },
  /** Records a file open and says whether to suggest the study assistant this time. */
  openFile: (): boolean => {
    write(recordFileOpen(current, Date.now()))
    return (
      current.opens.count >= STUDY_STREAK_OPENS && !isSnoozed(current, 'viewer-assistant', Date.now()) && nudgeStore.claimInterrupt()
    )
  },
  isSnoozed: (id: NudgeId) => isSnoozed(current, id, Date.now()),
  snooze: (id: NudgeId) => write(dismiss(current, id, Date.now())),
}

/** Visibility of one dismissible nudge. */
export function useNudge(id: NudgeId) {
  const state = useSyncExternalStore(subscribe, snapshot)
  const [mountedAt] = useState(() => Date.now())
  const visible = !isSnoozed(state, id, mountedAt)
  const snooze = useCallback(() => write(dismiss(current, id, Date.now())), [id])
  return { visible, snooze }
}
