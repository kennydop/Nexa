export type MoonColor = 'ember' | 'lime' | 'sky' | 'violet' | 'rose' | 'gold' | 'mint'

export interface College {
  id: string
  name: string
  short: string
  color: MoonColor
}

export interface Department {
  id: string
  collegeId: string
  faculty: string
  name: string
}

export type AwardLevel = 'diploma' | 'undergraduate' | 'postgraduate'

export interface Program {
  id: string
  departmentId: string
  collegeId: string
  name: string
  degree: string
  awardLevel: AwardLevel
  levels: number[]
}

export interface Course {
  id: string
  code: string
  title: string
  creditHours: number | null
  description: string | null
}

/** A course as it sits inside a programme's curriculum. */
export interface CurriculumEntry {
  course: Course
  level: number
  semester: 1 | 2
}

export type MaterialKind = 'slides' | 'notes' | 'book' | 'video' | 'link'

export interface Material {
  id: string
  courseId: string
  kind: MaterialKind
  title: string
  url: string
  /** MIME type when known; drives which in-app viewer opens. */
  mimeType: string | null
  uploaderName: string
  createdAt: string
}

export type ExamType = 'end_of_semester' | 'mid_semester' | 'quiz'

export interface PastQuestion {
  id: string
  courseId: string
  year: number
  semester: 1 | 2
  examType: ExamType
  url: string
  mimeType: string | null
  uploaderName: string
  createdAt: string
}

export type UserRole = 'student' | 'lecturer' | 'visitor'

export interface Post {
  id: string
  courseId: string
  authorName: string
  authorRole: UserRole
  /** Only moderator-verified lecturers get the Lecturer badge. */
  authorVerified: boolean
  body: string
  rating: number | null
  score: number
  myVote: -1 | 0 | 1
  replyCount: number
  parentId: string | null
  createdAt: string
}

export interface CourseStats {
  materials: number
  pastQuestions: number
  posts: number
  avgRating: number | null
  ratingCount: number
}

export interface SearchResults {
  programs: Program[]
  courses: Course[]
}

export interface Profile {
  id: string
  email: string | null
  fullName: string
  role: UserRole
  /** Verified UCC member: confirmed institutional email or moderator approval. */
  isVerified: boolean
  isModerator: boolean
  programId: string | null
  level: number | null
}

/** Editable by the user; role and verification are not. */
export type ProfilePatch = Partial<Pick<Profile, 'fullName' | 'programId' | 'level'>>

/* ---------- Moderation ---------- */
export interface Person {
  id: string
  fullName: string
  email: string
  role: UserRole
  isVerified: boolean
  verifiedVia: 'email' | 'moderator' | null
  isModerator: boolean
  emailConfirmed: boolean
  createdAt: string
}

export type ContentKind = 'post' | 'material' | 'past_question'
export type ContentStatus = 'published' | 'hidden'

export interface ModerationItem {
  kind: ContentKind
  id: string
  courseId: string
  title: string
  status: ContentStatus
  authorName: string
  url: string | null
  mimeType: string | null
  createdAt: string
}

export interface ProgramInput {
  name: string
  degree: string
  awardLevel: AwardLevel
  collegeId: string
  departmentId: string
  levels: number[]
}

export interface CurriculumCourseInput {
  programId: string
  code: string
  title: string
  creditHours: number | null
  level: number
  semester: 1 | 2
}
