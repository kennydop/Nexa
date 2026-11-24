import type {
  College,
  ContentKind,
  ContentStatus,
  ModerationItem,
  Person,
  Course,
  Department,
  ExamType,
  Material,
  MaterialKind,
  MoonColor,
  PastQuestion,
  Post,
  Profile,
  Program,
  UserRole,
} from '../types'

/* Row shapes as returned by PostgREST (snake_case). */
export interface CollegeRow { id: string; name: string; short: string; color: MoonColor }
export interface DepartmentRow { id: string; college_id: string; faculty: string; name: string }
export interface ProgramRow {
  id: string
  department_id: string
  college_id: string
  name: string
  degree: string
  award_level: Program['awardLevel']
  levels: number[]
}
export interface CourseRow {
  id: string
  code: string
  title: string
  credit_hours: number | null
  description: string | null
}
interface Uploader { uploader: { full_name: string } | null }
export interface MaterialRow extends Uploader {
  id: string
  course_id: string
  kind: MaterialKind
  title: string
  file_path: string | null
  url: string | null
  mime_type: string | null
  created_at: string
}
export interface PastQuestionRow extends Uploader {
  id: string
  course_id: string
  year: number
  semester: 1 | 2
  exam_type: ExamType
  file_path: string
  mime_type: string | null
  created_at: string
}
export interface PostRow {
  id: string
  course_id: string
  parent_id: string | null
  body: string
  rating: number | null
  created_at: string
  author_name: string
  author_role: UserRole
  author_verified: boolean
  score: number
  my_vote: -1 | 0 | 1
  reply_count: number
}
export interface ProfileRow {
  id: string
  full_name: string
  role: UserRole
  is_verified: boolean
  is_moderator: boolean
  program_id: string | null
  level: number | null
}
export interface PersonRow {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_verified: boolean
  verified_via: 'email' | 'moderator' | null
  is_moderator: boolean
  email_confirmed: boolean
  created_at: string
}
export interface ModerationRow {
  kind: ContentKind
  id: string
  course_id: string
  title: string
  status: ContentStatus
  author_name: string
  file_path: string | null
  url: string | null
  mime_type: string | null
  created_at: string
}

export interface CourseStatsRow {
  materials: number
  past_questions: number
  posts: number
  avg_rating: number | null
  rating_count: number
}

type ToUrl = (path: string) => string

export const mapCollege = (r: CollegeRow): College => ({ id: r.id, name: r.name, short: r.short, color: r.color })

export const mapDepartment = (r: DepartmentRow): Department => ({
  id: r.id,
  collegeId: r.college_id,
  faculty: r.faculty,
  name: r.name,
})

export const mapProgram = (r: ProgramRow): Program => ({
  id: r.id,
  departmentId: r.department_id,
  collegeId: r.college_id,
  name: r.name,
  degree: r.degree,
  awardLevel: r.award_level,
  levels: r.levels,
})

export const mapCourse = (r: CourseRow): Course => ({
  id: r.id,
  code: r.code,
  title: r.title,
  creditHours: r.credit_hours,
  description: r.description,
})

export const mapMaterial = (r: MaterialRow, toUrl: ToUrl): Material => ({
  id: r.id,
  courseId: r.course_id,
  kind: r.kind,
  title: r.title,
  url: r.file_path ? toUrl(r.file_path) : (r.url ?? ''),
  mimeType: r.mime_type,
  uploaderName: r.uploader?.full_name ?? 'Unknown',
  createdAt: r.created_at,
})

export const mapPastQuestion = (r: PastQuestionRow, toUrl: ToUrl): PastQuestion => ({
  id: r.id,
  courseId: r.course_id,
  year: r.year,
  semester: r.semester,
  examType: r.exam_type,
  url: toUrl(r.file_path),
  mimeType: r.mime_type,
  uploaderName: r.uploader?.full_name ?? 'Unknown',
  createdAt: r.created_at,
})

export const mapPost = (r: PostRow): Post => ({
  id: r.id,
  courseId: r.course_id,
  parentId: r.parent_id,
  body: r.body,
  rating: r.rating,
  createdAt: r.created_at,
  authorName: r.author_name,
  authorRole: r.author_role,
  authorVerified: r.author_verified,
  score: r.score,
  myVote: r.my_vote,
  replyCount: r.reply_count,
})

export const mapProfile = (r: ProfileRow, email: string | null): Profile => ({
  id: r.id,
  email,
  fullName: r.full_name,
  role: r.role,
  isVerified: r.is_verified,
  isModerator: r.is_moderator,
  programId: r.program_id,
  level: r.level,
})

export const mapPerson = (r: PersonRow): Person => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  role: r.role,
  isVerified: r.is_verified,
  verifiedVia: r.verified_via,
  isModerator: r.is_moderator,
  emailConfirmed: r.email_confirmed,
  createdAt: r.created_at,
})

export const mapModerationItem = (r: ModerationRow, toUrl: ToUrl): ModerationItem => ({
  kind: r.kind,
  id: r.id,
  courseId: r.course_id,
  title: r.title,
  status: r.status,
  authorName: r.author_name,
  url: r.file_path ? toUrl(r.file_path) : r.url,
  mimeType: r.mime_type,
  createdAt: r.created_at,
})
