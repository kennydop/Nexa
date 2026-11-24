import type { SupabaseClient } from '@supabase/supabase-js'
import { ALREADY_RATED, AuthRequiredError, RepositoryError } from '../repository'
import type { NewMaterial, NewPastQuestion, NewPost, PostSort, Repository } from '../repository'
import type { Course, CourseStats, Material, PastQuestion, Post, Profile, ProfilePatch, Program } from '../types'
import {
  mapCollege,
  mapCourse,
  mapDepartment,
  mapMaterial,
  mapPastQuestion,
  mapPost,
  mapProfile,
  mapProgram,
  type CollegeRow,
  type CourseRow,
  type CourseStatsRow,
  type DepartmentRow,
  type MaterialRow,
  type PastQuestionRow,
  type PostRow,
  type ProfileRow,
  type ProgramRow,
} from './mappers'

const BUCKET = 'course-files'
const SEARCH_LIMIT = 20
const UNIQUE_VIOLATION = '23505'

interface Result {
  data: unknown
  error: { message: string } | null
}

/** Throws on error; the caller states the row shape (the client is untyped). */
function unwrap<T>(result: Result, what: string): T {
  if (result.error) throw new RepositoryError(`Could not load ${what}.`, result.error)
  return result.data as T
}

/** Escapes characters PostgREST treats specially inside or()/ilike filters. */
function escapeFilter(text: string): string {
  return text.replace(/[%_,().*\\]/g, ' ').trim()
}

export class SupabaseRepository implements Repository {
  readonly mode = 'supabase' as const

  private readonly db: SupabaseClient

  constructor(db: SupabaseClient) {
    this.db = db
  }

  private async userId(): Promise<string> {
    const { data } = await this.db.auth.getSession()
    const id = data.session?.user.id
    if (!id) throw new AuthRequiredError()
    return id
  }

  publicUrl(path: string): string {
    return this.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  private async upload(courseId: string, file: File): Promise<string> {
    const uid = await this.userId()
    const safeName = file.name.replace(/[^\w.-]+/g, '-').slice(-80)
    const path = `${uid}/${courseId}/${crypto.randomUUID()}-${safeName}`
    const { error } = await this.db.storage.from(BUCKET).upload(path, file, { contentType: file.type })
    if (error) throw new RepositoryError('Upload failed. Check the file type and size (25 MB max).', error)
    return path
  }

  async listColleges() {
    const rows = unwrap<CollegeRow[]>(await this.db.from('colleges').select('*').order('sort'), 'colleges')
    return rows.map(mapCollege)
  }

  async listDepartments(collegeId: string) {
    const rows = unwrap<DepartmentRow[]>(
      await this.db.from('departments').select('*').eq('college_id', collegeId).order('name'),
      'departments',
    )
    return rows.map(mapDepartment)
  }

  async listPrograms(filter: { collegeId?: string; departmentId?: string }): Promise<Program[]> {
    let query = this.db.from('programs').select('*').order('name')
    if (filter.collegeId) query = query.eq('college_id', filter.collegeId)
    if (filter.departmentId) query = query.eq('department_id', filter.departmentId)
    return unwrap<ProgramRow[]>(await query, 'programmes').map(mapProgram)
  }

  async getProgram(id: string) {
    const row = unwrap<ProgramRow | null>(await this.db.from('programs').select('*').eq('id', id).maybeSingle(), 'programme')
    return row ? mapProgram(row) : null
  }

  async getCurriculum(programId: string) {
    const rows = unwrap<{ level: number; semester: 1 | 2; course: CourseRow }[]>(
      await this.db
        .from('program_courses')
        .select('level, semester, course:courses(*)')
        .eq('program_id', programId),
      'curriculum',
    )
    return rows.map((row) => ({ level: row.level, semester: row.semester, course: mapCourse(row.course) }))
  }

  async getCourse(id: string) {
    const row = unwrap<CourseRow | null>(await this.db.from('courses').select('*').eq('id', id).maybeSingle(), 'course')
    return row ? mapCourse(row) : null
  }

  async getCourseStats(id: string): Promise<CourseStats> {
    const row = unwrap<CourseStatsRow>(
      await this.db.from('course_stats').select('*').eq('course_id', id).single(),
      'course stats',
    )
    return {
      materials: row.materials,
      pastQuestions: row.past_questions,
      posts: row.posts,
      avgRating: row.avg_rating,
      ratingCount: row.rating_count,
    }
  }

  async search(query: string) {
    const q = escapeFilter(query)
    if (q.length < 2) return { programs: [], courses: [] }
    const codeLike = q.replace(/\s+/g, '').replace(/^([a-z]+)(\d)/i, '$1 $2')
    const [courses, programs] = await Promise.all([
      this.db
        .from('courses')
        .select('*')
        .or(`code.ilike.%${codeLike}%,title.ilike.%${q}%`)
        .order('code')
        .limit(SEARCH_LIMIT),
      this.db.from('programs').select('*').ilike('name', `%${q}%`).order('name').limit(SEARCH_LIMIT),
    ])
    return {
      courses: unwrap<CourseRow[]>(courses, 'courses').map((row: CourseRow) => mapCourse(row)),
      programs: unwrap<ProgramRow[]>(programs, 'programmes').map((row: ProgramRow) => mapProgram(row)),
    }
  }

  async listMaterials(courseId: string): Promise<Material[]> {
    const rows = unwrap<MaterialRow[]>(
      await this.db
        .from('materials')
        .select('*, uploader:profiles(full_name)')
        .eq('course_id', courseId)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      'materials',
    )
    return rows.map((row) => mapMaterial(row, (p) => this.publicUrl(p)))
  }

  async listPastQuestions(courseId: string): Promise<PastQuestion[]> {
    const rows = unwrap<PastQuestionRow[]>(
      await this.db
        .from('past_questions')
        .select('*, uploader:profiles(full_name)')
        .eq('course_id', courseId)
        .eq('status', 'published')
        .order('year', { ascending: false })
        .order('semester', { ascending: false }),
      'past questions',
    )
    return rows.map((row) => mapPastQuestion(row, (p) => this.publicUrl(p)))
  }

  async addMaterial(input: NewMaterial): Promise<Material> {
    const filePath = input.file ? await this.upload(input.courseId, input.file) : null
    const row = unwrap<MaterialRow>(
      await this.db
        .from('materials')
        .insert({
          course_id: input.courseId,
          kind: input.kind,
          title: input.title,
          file_path: filePath,
          url: filePath ? null : input.link,
          mime_type: input.file?.type || null,
          size_bytes: input.file?.size ?? null,
        })
        .select('*, uploader:profiles(full_name)')
        .single(),
      'material',
    )
    return mapMaterial(row, (p) => this.publicUrl(p))
  }

  async addPastQuestion(input: NewPastQuestion): Promise<PastQuestion> {
    const filePath = await this.upload(input.courseId, input.file)
    const row = unwrap<PastQuestionRow>(
      await this.db
        .from('past_questions')
        .insert({
          course_id: input.courseId,
          year: input.year,
          semester: input.semester,
          exam_type: input.examType,
          file_path: filePath,
          mime_type: input.file.type || null,
          size_bytes: input.file.size,
        })
        .select('*, uploader:profiles(full_name)')
        .single(),
      'past question',
    )
    return mapPastQuestion(row, (p) => this.publicUrl(p))
  }

  async listPosts(courseId: string, sort: PostSort): Promise<Post[]> {
    const query = this.db.from('post_feed').select('*').eq('course_id', courseId).is('parent_id', null)
    const ordered =
      sort === 'top'
        ? query.order('score', { ascending: false }).order('created_at', { ascending: false })
        : query.order('created_at', { ascending: false })
    return unwrap<PostRow[]>(await ordered.limit(100), 'discussion').map(mapPost)
  }

  async listReplies(parentId: string): Promise<Post[]> {
    const rows = unwrap<PostRow[]>(
      await this.db.from('post_feed').select('*').eq('parent_id', parentId).order('created_at'),
      'replies',
    )
    return rows.map(mapPost)
  }

  async addPost(input: NewPost): Promise<Post> {
    await this.userId()
    const result = await this.db
        .from('posts')
        .insert({
          course_id: input.courseId,
          body: input.body,
          rating: input.parentId ? null : input.rating,
          parent_id: input.parentId,
        })
        .select('id')
        .single()
    if (result.error?.code === UNIQUE_VIOLATION) throw new RepositoryError(ALREADY_RATED, result.error)
    const inserted = unwrap<{ id: string }>(result, 'post')
    const row = unwrap<PostRow>(await this.db.from('post_feed').select('*').eq('id', inserted.id).single(), 'post')
    return mapPost(row)
  }

  async vote(postId: string, value: -1 | 0 | 1): Promise<void> {
    const uid = await this.userId()
    const result =
      value === 0
        ? await this.db.from('post_votes').delete().match({ post_id: postId, user_id: uid })
        : await this.db.from('post_votes').upsert({ post_id: postId, user_id: uid, value })
    if (result.error) throw new RepositoryError('Could not save your vote.', result.error)
  }

  async listBookmarks(): Promise<Course[]> {
    const uid = await this.userId()
    const rows = unwrap<{ course: CourseRow }[]>(
      await this.db
        .from('bookmarks')
        .select('course:courses(*)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      'saved courses',
    )
    return rows.map((row) => mapCourse(row.course))
  }

  async isBookmarked(courseId: string) {
    const { data } = await this.db.auth.getSession()
    const uid = data.session?.user.id
    if (!uid) return false
    const { count, error } = await this.db
      .from('bookmarks')
      .select('course_id', { count: 'exact', head: true })
      .match({ user_id: uid, course_id: courseId })
    if (error) throw new RepositoryError('Could not check saved state.', error)
    return (count ?? 0) > 0
  }

  async setBookmark(courseId: string, saved: boolean) {
    const uid = await this.userId()
    const result = saved
      ? await this.db.from('bookmarks').upsert({ user_id: uid, course_id: courseId })
      : await this.db.from('bookmarks').delete().match({ user_id: uid, course_id: courseId })
    if (result.error) throw new RepositoryError('Could not update saved courses.', result.error)
  }

  async getProfile(): Promise<Profile | null> {
    const { data } = await this.db.auth.getSession()
    const user = data.session?.user
    if (!user) return null
    const row = unwrap<ProfileRow | null>(
      await this.db.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      'profile',
    )
    return row ? mapProfile(row, user.email ?? null) : null
  }

  async updateProfile(patch: ProfilePatch): Promise<Profile> {
    const { data } = await this.db.auth.getSession()
    const user = data.session?.user
    if (!user) throw new AuthRequiredError()
    const row = unwrap<ProfileRow>(
      await this.db
        .from('profiles')
        .update({
          ...(patch.fullName !== undefined && { full_name: patch.fullName }),
          ...(patch.programId !== undefined && { program_id: patch.programId }),
          ...(patch.level !== undefined && { level: patch.level }),
        })
        .eq('id', user.id)
        .select('*')
        .single(),
      'profile',
    )
    return mapProfile(row, user.email ?? null)
  }
}
