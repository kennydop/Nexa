import type { SupabaseClient } from '@supabase/supabase-js'
import { courseIdFromCode, normaliseCourseCode, programIdFromName } from '@/lib/institution'
import { RepositoryError, type ModerationRepository } from '../repository'
import type { ContentKind, ContentStatus, CurriculumCourseInput, Program, ProgramInput, UserRole } from '../types'
import { mapModerationItem, mapPerson, mapProgram, type ModerationRow, type PersonRow, type ProgramRow } from './mappers'

const BUCKET = 'course-files'
const FEED_LIMIT = 100
const TABLE: Record<ContentKind, string> = {
  post: 'posts',
  material: 'materials',
  past_question: 'past_questions',
}

function check(error: { message: string } | null, action: string): void {
  if (error) throw new RepositoryError(`Could not ${action}: ${error.message}`, error)
}

/** Moderator tools. Every call is re-authorised in Postgres (RPC checks + RLS). */
export class SupabaseModeration implements ModerationRepository {
  private readonly db: SupabaseClient

  constructor(db: SupabaseClient) {
    this.db = db
  }

  async listPeople(search: string, onlyPending: boolean) {
    const { data, error } = await this.db.rpc('admin_list_people', { search, only_pending: onlyPending })
    check(error, 'load people')
    return ((data ?? []) as PersonRow[]).map(mapPerson)
  }

  async setVerification(userId: string, verified: boolean, role: UserRole) {
    const { error } = await this.db.rpc('admin_set_verification', { target: userId, verified, new_role: role })
    check(error, 'update verification')
  }

  async setModerator(userId: string, value: boolean) {
    const { error } = await this.db.rpc('admin_set_moderator', { target: userId, value })
    check(error, 'update moderator access')
  }

  async listContent() {
    const { data, error } = await this.db
      .from('moderation_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT)
    check(error, 'load recent activity')
    const toUrl = (path: string) => this.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    return ((data ?? []) as ModerationRow[]).map((row) => mapModerationItem(row, toUrl))
  }

  async setContentStatus(kind: ContentKind, id: string, status: ContentStatus) {
    const { error } = await this.db.from(TABLE[kind]).update({ status }).eq('id', id)
    check(error, 'update the item')
  }

  async deleteContent(kind: ContentKind, id: string) {
    const filePath = kind === 'post' ? null : await this.filePathOf(kind, id)
    const { error } = await this.db.from(TABLE[kind]).delete().eq('id', id)
    check(error, 'delete the item')
    if (filePath) {
      const removed = await this.db.storage.from(BUCKET).remove([filePath])
      check(removed.error, 'remove the stored file (the item itself was deleted)')
    }
  }

  private async filePathOf(kind: Exclude<ContentKind, 'post'>, id: string): Promise<string | null> {
    const { data, error } = await this.db.from(TABLE[kind]).select('file_path').eq('id', id).maybeSingle<{ file_path: string | null }>()
    check(error, 'find the item')
    return data?.file_path ?? null
  }

  async addCurriculumCourse(input: CurriculumCourseInput) {
    const code = normaliseCourseCode(input.code)
    const id = courseIdFromCode(code)
    const course = await this.db
      .from('courses')
      .upsert({ id, code, title: input.title.trim(), credit_hours: input.creditHours }, { onConflict: 'id' })
    check(course.error, 'save the course')
    const row = await this.db.from('program_courses').upsert(
      { program_id: input.programId, course_id: id, level: input.level, semester: input.semester },
      { onConflict: 'program_id,course_id' },
    )
    check(row.error, 'add the course to the programme')
  }

  async removeCurriculumCourse(programId: string, courseId: string) {
    const { error } = await this.db.from('program_courses').delete().match({ program_id: programId, course_id: courseId })
    check(error, 'remove the course')
  }

  async addProgram(input: ProgramInput): Promise<Program> {
    const { data, error } = await this.db
      .from('programs')
      .insert({
        id: programIdFromName(input.name),
        name: input.name.trim(),
        degree: input.degree.trim(),
        award_level: input.awardLevel,
        college_id: input.collegeId,
        department_id: input.departmentId,
        levels: input.levels,
      })
      .select()
      .single<ProgramRow>()
    if (error?.code === '23505') throw new RepositoryError(`${input.name.trim()} already exists.`, error)
    check(error, 'create the programme')
    return mapProgram(data as ProgramRow)
  }
}
