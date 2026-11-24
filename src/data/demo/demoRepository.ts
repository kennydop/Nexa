import { ALREADY_RATED, AuthRequiredError, RepositoryError } from '../repository'
import type { NewMaterial, NewPastQuestion, NewPost, PostSort, Repository } from '../repository'
import { loadCatalog, type Catalog } from '../catalog'
import { searchCourses, searchPrograms } from '../search'
import type { Course, CourseStats, Material, PastQuestion, Post, Profile, ProfilePatch } from '../types'
import { SAMPLE_MATERIALS, SAMPLE_PAST_QUESTIONS, SAMPLE_POSTS } from './samples'
import { curriculumKey, newId, type DemoStore } from './store'

const LATENCY_MS = 120

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function hotness(post: Post): number {
  return post.score + post.replyCount * 0.5
}

/** In-browser backend used when Supabase is not configured. */
export class DemoRepository implements Repository {
  readonly mode = 'demo' as const
  private readonly store: DemoStore
  private readonly baseCatalog: Promise<Catalog> = loadCatalog()

  constructor(store: DemoStore) {
    this.store = store
  }

  private get state() {
    return this.store.state
  }

  /** Bundled catalogue plus moderator curriculum edits. */
  private async catalog(): Promise<Catalog> {
    const base = await this.baseCatalog
    const { extraCourses, extraCurriculum, extraPrograms, removedCurriculum } = this.state
    const removed = new Set(removedCurriculum)
    const known = new Set(base.courses.map((c) => c.id))
    return {
      ...base,
      programs: [...base.programs, ...extraPrograms],
      courses: [...base.courses, ...extraCourses.filter((c) => !known.has(c.id))],
      curriculum: [...base.curriculum, ...extraCurriculum].filter(
        (row) => !removed.has(curriculumKey(row.programId, row.courseId)),
      ),
    }
  }

  private isVisible(id: string): boolean {
    return !this.state.hiddenIds.includes(id) && !this.state.deletedIds.includes(id)
  }

  private requireProfile(): Profile {
    if (!this.state.profile) throw new AuthRequiredError()
    return this.state.profile
  }

  async listColleges() {
    return (await this.baseCatalog).colleges
  }

  async listDepartments(collegeId: string) {
    return (await this.baseCatalog).departments.filter((d) => d.collegeId === collegeId)
  }

  async listPrograms(filter: { collegeId?: string; departmentId?: string }) {
    return (await this.catalog()).programs.filter(
      (p) =>
        (!filter.collegeId || p.collegeId === filter.collegeId) &&
        (!filter.departmentId || p.departmentId === filter.departmentId),
    )
  }

  async getProgram(id: string) {
    return (await this.catalog()).programs.find((p) => p.id === id) ?? null
  }

  async getCurriculum(programId: string) {
    const { curriculum, courses } = await this.catalog()
    const byId = new Map(courses.map((c) => [c.id, c]))
    return curriculum
      .filter((row) => row.programId === programId)
      .flatMap((row) => {
        const course = byId.get(row.courseId)
        return course ? [{ course, level: row.level, semester: row.semester }] : []
      })
  }

  async getCourse(id: string) {
    return (await this.catalog()).courses.find((c) => c.id === id) ?? null
  }

  /** Samples + user posts, with votes and reply counts applied; moderation filtered. */
  allPosts(): Post[] {
    const posts = [...SAMPLE_POSTS, ...this.state.posts].filter((p) => this.isVisible(p.id))
    return posts.map((post) => {
      const myVote = this.state.votes[post.id] ?? 0
      const replyCount = posts.filter((p) => p.parentId === post.id).length
      return { ...post, myVote, score: post.score + myVote, replyCount }
    })
  }

  allMaterials(): Material[] {
    return [...this.state.materials, ...SAMPLE_MATERIALS].filter((m) => this.isVisible(m.id))
  }

  allPastQuestions(): PastQuestion[] {
    return [...this.state.pastQuestions, ...SAMPLE_PAST_QUESTIONS].filter((q) => this.isVisible(q.id))
  }

  async getCourseStats(id: string): Promise<CourseStats> {
    const posts = this.allPosts().filter((p) => p.courseId === id && p.parentId === null)
    const ratings = posts.flatMap((p) => (p.rating ? [p.rating] : []))
    return {
      materials: this.allMaterials().filter((m) => m.courseId === id).length,
      pastQuestions: this.allPastQuestions().filter((q) => q.courseId === id).length,
      posts: posts.length,
      ratingCount: ratings.length,
      avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    }
  }

  async search(query: string) {
    const { courses, programs } = await this.catalog()
    return { courses: searchCourses(courses, query), programs: searchPrograms(programs, query) }
  }

  async listMaterials(courseId: string): Promise<Material[]> {
    return this.allMaterials()
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async listPastQuestions(courseId: string): Promise<PastQuestion[]> {
    return this.allPastQuestions()
      .filter((q) => q.courseId === courseId)
      .sort((a, b) => b.year - a.year || b.semester - a.semester)
  }

  async addMaterial(input: NewMaterial): Promise<Material> {
    const profile = this.requireProfile()
    // Object URLs live for this tab only, which is fine for a demo.
    const url = input.file ? URL.createObjectURL(input.file) : input.link
    if (!url) throw new RepositoryError('Attach a file or paste a link.')
    await wait()
    const material: Material = {
      id: newId('mat'),
      courseId: input.courseId,
      kind: input.kind,
      title: input.title,
      url,
      mimeType: input.file?.type || null,
      uploaderName: profile.fullName,
      createdAt: new Date().toISOString(),
    }
    this.store.update((s) => ({ ...s, materials: [material, ...s.materials] }))
    return material
  }

  async addPastQuestion(input: NewPastQuestion): Promise<PastQuestion> {
    const profile = this.requireProfile()
    await wait()
    const question: PastQuestion = {
      id: newId('pq'),
      courseId: input.courseId,
      year: input.year,
      semester: input.semester,
      examType: input.examType,
      url: URL.createObjectURL(input.file),
      mimeType: input.file.type || null,
      uploaderName: profile.fullName,
      createdAt: new Date().toISOString(),
    }
    this.store.update((s) => ({ ...s, pastQuestions: [question, ...s.pastQuestions] }))
    return question
  }

  async listPosts(courseId: string, sort: PostSort): Promise<Post[]> {
    await wait()
    const posts = this.allPosts().filter((p) => p.courseId === courseId && p.parentId === null)
    return [...posts].sort((a, b) =>
      sort === 'top' ? hotness(b) - hotness(a) : b.createdAt.localeCompare(a.createdAt),
    )
  }

  async listReplies(parentId: string): Promise<Post[]> {
    return this.allPosts()
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async addPost(input: NewPost): Promise<Post> {
    const profile = this.requireProfile()
    const rated = input.parentId === null && input.rating !== null
    const alreadyRated = this.state.posts.some(
      (p) => p.courseId === input.courseId && p.parentId === null && p.rating !== null && p.authorName === profile.fullName,
    )
    if (rated && alreadyRated) throw new RepositoryError(ALREADY_RATED)
    await wait()
    const post: Post = {
      id: newId('post'),
      courseId: input.courseId,
      authorName: profile.fullName,
      authorRole: profile.role,
      authorVerified: profile.isVerified,
      body: input.body,
      rating: input.parentId ? null : input.rating,
      score: 0,
      myVote: 0,
      replyCount: 0,
      parentId: input.parentId,
      createdAt: new Date().toISOString(),
    }
    this.store.update((s) => ({ ...s, posts: [...s.posts, post] }))
    return post
  }

  async vote(postId: string, value: -1 | 0 | 1): Promise<void> {
    this.requireProfile()
    this.store.update((s) => {
      const { [postId]: _previous, ...rest } = s.votes
      return { ...s, votes: value === 0 ? rest : { ...rest, [postId]: value } }
    })
  }

  async listBookmarks(): Promise<Course[]> {
    const { courses } = await this.catalog()
    const byId = new Map(courses.map((c) => [c.id, c]))
    return this.state.bookmarks.flatMap((id) => byId.get(id) ?? [])
  }

  async isBookmarked(courseId: string) {
    return this.state.bookmarks.includes(courseId)
  }

  async setBookmark(courseId: string, saved: boolean) {
    this.requireProfile()
    this.store.update((s) => {
      const others = s.bookmarks.filter((id) => id !== courseId)
      return { ...s, bookmarks: saved ? [courseId, ...others] : others }
    })
  }

  async getProfile() {
    return this.state.profile
  }

  async updateProfile(patch: ProfilePatch) {
    const profile = { ...this.requireProfile(), ...patch }
    this.store.update((s) => ({ ...s, profile }))
    return profile
  }
}
