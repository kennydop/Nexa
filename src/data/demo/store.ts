import type { CurriculumRow } from '../catalog'
import type { Course, Material, PastQuestion, Person, Post, Profile, Program } from '../types'

/** Everything a visitor can change in demo mode, persisted per browser. */
export interface DemoState {
  profile: Profile | null
  posts: Post[]
  votes: Record<string, -1 | 1>
  bookmarks: string[]
  materials: Material[]
  pastQuestions: PastQuestion[]
  /** Moderator edits layered over the bundled samples and catalogue. */
  people: Person[]
  hiddenIds: string[]
  deletedIds: string[]
  extraCourses: Course[]
  extraPrograms: Program[]
  extraCurriculum: CurriculumRow[]
  removedCurriculum: string[]
}

const STORAGE_KEY = 'nexa-demo-v2'

export const EMPTY_STATE: DemoState = {
  profile: null,
  posts: [],
  votes: {},
  bookmarks: [],
  materials: [],
  pastQuestions: [],
  people: [],
  hiddenIds: [],
  deletedIds: [],
  extraCourses: [],
  extraPrograms: [],
  extraCurriculum: [],
  removedCurriculum: [],
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<DemoState>) }
  } catch {
    // Private mode or corrupted JSON: start fresh rather than crash.
    return EMPTY_STATE
  }
}

/** Single source of truth shared by the demo repository, auth and moderation. */
export class DemoStore {
  private current: DemoState = load()

  get state(): DemoState {
    return this.current
  }

  update(change: (state: DemoState) => DemoState): DemoState {
    this.current = change(this.current)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current))
    } catch {
      // Storage full or blocked: the session still works in memory.
    }
    return this.current
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export const curriculumKey = (programId: string, courseId: string) => `${programId}|${courseId}`
