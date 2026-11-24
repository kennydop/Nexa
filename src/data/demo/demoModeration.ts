import { courseIdFromCode, normaliseCourseCode, programIdFromName } from '@/lib/institution'
import { RepositoryError, type ModerationRepository } from '../repository'
import { loadCatalog } from '../catalog'
import type { ContentKind, ContentStatus, CurriculumCourseInput, ModerationItem, Person, Program, ProgramInput, UserRole } from '../types'
import { SAMPLE_MATERIALS, SAMPLE_PAST_QUESTIONS, SAMPLE_PEOPLE, SAMPLE_POSTS } from './samples'
import { curriculumKey, type DemoStore } from './store'

const EXCERPT = 120

/** Claimed a UCC role but not yet verified: the moderator's queue. */
const isPending = (p: Person) => p.role !== 'visitor' && !p.isVerified

/** Demo moderator tools: edits are layered over the bundled samples. */
export class DemoModeration implements ModerationRepository {
  private readonly store: DemoStore

  constructor(store: DemoStore) {
    this.store = store
  }

  private requireModerator(): void {
    if (!this.store.state.profile?.isModerator) throw new RepositoryError('Moderators only.')
  }

  private people(): Person[] {
    const overrides = new Map(this.store.state.people.map((p) => [p.id, p]))
    const samples = SAMPLE_PEOPLE.map((p) => overrides.get(p.id) ?? p)
    const sampleIds = new Set(SAMPLE_PEOPLE.map((p) => p.id))
    return [...this.store.state.people.filter((p) => !sampleIds.has(p.id)), ...samples]
  }

  private updatePerson(userId: string, change: (person: Person) => Person): void {
    const person = this.people().find((p) => p.id === userId)
    if (!person) throw new RepositoryError('That person no longer exists.')
    const next = change(person)
    this.store.update((s) => ({
      ...s,
      people: [next, ...s.people.filter((p) => p.id !== userId)],
      profile:
        s.profile?.id === userId
          ? { ...s.profile, role: next.role, isVerified: next.isVerified, isModerator: next.isModerator }
          : s.profile,
    }))
  }

  async listPeople(search: string, onlyPending: boolean) {
    this.requireModerator()
    const q = search.trim().toLowerCase()
    return this.people()
      .filter((p) => !q || p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      .filter((p) => !onlyPending || (p.role !== 'visitor' && !p.isVerified))
      .sort((a, b) => Number(isPending(b)) - Number(isPending(a)))
  }

  async setVerification(userId: string, verified: boolean, role: UserRole) {
    this.requireModerator()
    const isVerified = verified && role !== 'visitor'
    this.updatePerson(userId, (p) => ({ ...p, role, isVerified, verifiedVia: isVerified ? 'moderator' : null }))
  }

  async setModerator(userId: string, value: boolean) {
    this.requireModerator()
    if (userId === this.store.state.profile?.id && !value) {
      throw new RepositoryError('You cannot remove your own moderator access.')
    }
    this.updatePerson(userId, (p) => ({ ...p, isModerator: value }))
  }

  async listContent(): Promise<ModerationItem[]> {
    this.requireModerator()
    const { posts, materials, pastQuestions, hiddenIds, deletedIds } = this.store.state
    const hidden = new Set(hiddenIds)
    const deleted = new Set(deletedIds)
    const status = (id: string): ContentStatus => (hidden.has(id) ? 'hidden' : 'published')
    const items: ModerationItem[] = [
      ...[...SAMPLE_POSTS, ...posts].map((p) => ({
        kind: 'post' as const,
        id: p.id,
        courseId: p.courseId,
        title: p.body.length > EXCERPT ? `${p.body.slice(0, EXCERPT)}…` : p.body,
        status: status(p.id),
        authorName: p.authorName,
        url: null,
        mimeType: null,
        createdAt: p.createdAt,
      })),
      ...[...SAMPLE_MATERIALS, ...materials].map((m) => ({
        kind: 'material' as const,
        id: m.id,
        courseId: m.courseId,
        title: m.title,
        status: status(m.id),
        authorName: m.uploaderName,
        url: m.url,
        mimeType: m.mimeType,
        createdAt: m.createdAt,
      })),
      ...[...SAMPLE_PAST_QUESTIONS, ...pastQuestions].map((q) => ({
        kind: 'past_question' as const,
        id: q.id,
        courseId: q.courseId,
        title: `${q.year} semester ${q.semester}`,
        status: status(q.id),
        authorName: q.uploaderName,
        url: q.url,
        mimeType: q.mimeType,
        createdAt: q.createdAt,
      })),
    ]
    return items.filter((i) => !deleted.has(i.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async setContentStatus(_kind: ContentKind, id: string, next: ContentStatus) {
    this.requireModerator()
    this.store.update((s) => {
      const others = s.hiddenIds.filter((h) => h !== id)
      return { ...s, hiddenIds: next === 'hidden' ? [id, ...others] : others }
    })
  }

  async deleteContent(_kind: ContentKind, id: string) {
    this.requireModerator()
    this.store.update((s) => ({ ...s, deletedIds: [id, ...s.deletedIds] }))
  }

  async addCurriculumCourse(input: CurriculumCourseInput) {
    this.requireModerator()
    const code = normaliseCourseCode(input.code)
    const courseId = courseIdFromCode(code)
    this.store.update((s) => ({
      ...s,
      extraCourses: [
        { id: courseId, code, title: input.title.trim(), creditHours: input.creditHours, description: null },
        ...s.extraCourses.filter((c) => c.id !== courseId),
      ],
      extraCurriculum: [
        { programId: input.programId, courseId, level: input.level, semester: input.semester },
        ...s.extraCurriculum.filter((r) => curriculumKey(r.programId, r.courseId) !== curriculumKey(input.programId, courseId)),
      ],
      removedCurriculum: s.removedCurriculum.filter((k) => k !== curriculumKey(input.programId, courseId)),
    }))
  }

  async removeCurriculumCourse(programId: string, courseId: string) {
    this.requireModerator()
    this.store.update((s) => ({ ...s, removedCurriculum: [curriculumKey(programId, courseId), ...s.removedCurriculum] }))
  }

  async addProgram(input: ProgramInput): Promise<Program> {
    this.requireModerator()
    const id = programIdFromName(input.name)
    const taken = (await loadCatalog()).programs.some((p) => p.id === id) || this.store.state.extraPrograms.some((p) => p.id === id)
    if (taken) throw new RepositoryError(`${input.name.trim()} already exists.`)
    const program: Program = { ...input, id, name: input.name.trim(), degree: input.degree.trim() }
    this.store.update((s) => ({ ...s, extraPrograms: [program, ...s.extraPrograms] }))
    return program
  }
}
