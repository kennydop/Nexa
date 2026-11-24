import type {
  College,
  Course,
  CourseStats,
  CurriculumEntry,
  Department,
  ExamType,
  Material,
  MaterialKind,
  ContentKind,
  ContentStatus,
  CurriculumCourseInput,
  ProgramInput,
  ModerationItem,
  PastQuestion,
  Person,
  Post,
  Profile,
  ProfilePatch,
  Program,
  SearchResults,
  UserRole,
} from './types'

export interface NewPost {
  courseId: string
  body: string
  rating: number | null
  parentId: string | null
}

export interface NewMaterial {
  courseId: string
  kind: MaterialKind
  title: string
  file: File | null
  link: string | null
}

export interface NewPastQuestion {
  courseId: string
  year: number
  semester: 1 | 2
  examType: ExamType
  file: File
}

export type PostSort = 'top' | 'new'

/**
 * Everything the UI needs from a backend. The Supabase implementation is used
 * when credentials are configured; otherwise the in-browser demo backend runs.
 */
export interface Repository {
  readonly mode: 'supabase' | 'demo'

  listColleges(): Promise<College[]>
  listDepartments(collegeId: string): Promise<Department[]>
  listPrograms(filter: { collegeId?: string; departmentId?: string }): Promise<Program[]>
  getProgram(id: string): Promise<Program | null>
  getCurriculum(programId: string): Promise<CurriculumEntry[]>
  getCourse(id: string): Promise<Course | null>
  getCourseStats(id: string): Promise<CourseStats>
  search(query: string): Promise<SearchResults>

  listMaterials(courseId: string): Promise<Material[]>
  listPastQuestions(courseId: string): Promise<PastQuestion[]>
  addMaterial(input: NewMaterial): Promise<Material>
  addPastQuestion(input: NewPastQuestion): Promise<PastQuestion>

  listPosts(courseId: string, sort: PostSort): Promise<Post[]>
  listReplies(parentId: string): Promise<Post[]>
  addPost(input: NewPost): Promise<Post>
  vote(postId: string, value: -1 | 0 | 1): Promise<void>

  listBookmarks(): Promise<Course[]>
  isBookmarked(courseId: string): Promise<boolean>
  setBookmark(courseId: string, saved: boolean): Promise<void>

  getProfile(): Promise<Profile | null>
  updateProfile(patch: ProfilePatch): Promise<Profile>
}

/** Moderator-only operations; the backend re-checks moderator rights on every call. */
export interface ModerationRepository {
  listPeople(search: string, onlyPending: boolean): Promise<Person[]>
  setVerification(userId: string, verified: boolean, role: UserRole): Promise<void>
  setModerator(userId: string, value: boolean): Promise<void>
  listContent(): Promise<ModerationItem[]>
  setContentStatus(kind: ContentKind, id: string, status: ContentStatus): Promise<void>
  deleteContent(kind: ContentKind, id: string): Promise<void>
  addCurriculumCourse(input: CurriculumCourseInput): Promise<void>
  removeCurriculumCourse(programId: string, courseId: string): Promise<void>
  addProgram(input: ProgramInput): Promise<Program>
}

export const ALREADY_RATED = 'You’ve already rated this course. Post without stars to add more thoughts.'

export class RepositoryError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'RepositoryError'
    this.cause = cause
  }
}

/** Signed up but hasn't clicked the confirmation link yet. */
export class EmailNotConfirmedError extends RepositoryError {
  readonly email: string

  constructor(email: string, cause?: unknown) {
    super('Confirm your email first. Check your inbox for the link we sent.', cause)
    this.name = 'EmailNotConfirmedError'
    this.email = email
  }
}

export class AuthRequiredError extends RepositoryError {
  constructor() {
    super('Sign in to do that.')
    this.name = 'AuthRequiredError'
  }
}
