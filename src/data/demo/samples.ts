import { A, MATERIALS, PAST_QUESTIONS, THREADS, type SeedAuthor, type SeedReply } from '../seed/content'
import type { Material, PastQuestion, Person, Post } from '../types'

/* Demo-mode view of the shared sample content in src/data/seed/content.ts. */
const HOUR = 3_600_000
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString()

function toPost(seed: SeedReply & { rating?: number }, courseId: string, parentId: string | null): Post {
  return {
    id: seed.id,
    courseId,
    authorName: seed.by.name,
    authorRole: seed.by.role,
    authorVerified: seed.by.verified,
    body: seed.body,
    rating: seed.rating ?? null,
    score: seed.score ?? 0,
    myVote: 0,
    replyCount: 0,
    parentId,
    createdAt: ago(seed.hours),
  }
}

export const SAMPLE_POSTS: Post[] = THREADS.flatMap((thread) => [
  toPost(thread, thread.course, null),
  ...(thread.replies ?? []).map((reply) => toPost(reply, thread.course, thread.id)),
])

export const SAMPLE_MATERIALS: Material[] = MATERIALS.map((m) => ({
  id: m.id,
  courseId: m.course,
  kind: m.kind,
  title: m.title,
  url: m.url,
  mimeType: m.mimeType,
  uploaderName: m.by.name,
  createdAt: ago(m.hours),
}))

export const SAMPLE_PAST_QUESTIONS: PastQuestion[] = PAST_QUESTIONS.map((q) => ({
  id: q.id,
  courseId: q.course,
  year: q.year,
  semester: q.semester,
  examType: q.examType,
  url: q.url,
  mimeType: q.mimeType,
  uploaderName: q.by.name,
  createdAt: ago(q.hours),
}))

/** Verified UCC members get an institutional address; everyone else a personal one. */
function demoEmail(a: SeedAuthor): string {
  if (a.verified && a.role === 'student') return `${a.key}@stu.ucc.edu.gh`
  if (a.verified && a.role === 'lecturer') return `${a.key}@ucc.edu.gh`
  return `${a.key}@gmail.com`
}

const person = (id: string, a: SeedAuthor, hours: number): Person => ({
  id,
  fullName: a.name,
  email: demoEmail(a),
  role: a.role,
  isVerified: a.verified,
  verifiedVia: a.verified ? 'email' : null,
  isModerator: false,
  emailConfirmed: true,
  createdAt: ago(hours),
})

const PENDING: SeedAuthor[] = [
  { key: 'kwame.asante.phd', name: 'Dr. Kwame Asante', role: 'lecturer', verified: false },
  { key: 'akosua.frimpong', name: 'Mrs. Akosua Frimpong', role: 'lecturer', verified: false },
]

/** Demo directory for the moderator portal, including people awaiting review. */
export const SAMPLE_PEOPLE: Person[] = [
  person('u-pending-1', PENDING[0], 5),
  person('u-pending-2', PENDING[1], 28),
  ...Object.values(A).map((a, i) => person(`u-${a.key}`, a, 300 + i * 40)),
]
