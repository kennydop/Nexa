import type { Material, PastQuestion, Person, Post, UserRole } from '../types'

/*
 * Seed content for demo mode only (the banner says so). People and posts are
 * fictional; files in /public/demo are stamped "not an official UCC document".
 */
const HOUR = 3_600_000
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString()

interface Author {
  name: string
  role: UserRole
  verified: boolean
}

const A = {
  kofi: { name: 'Kofi Mensah', role: 'student', verified: true },
  ama: { name: 'Ama Owusu', role: 'student', verified: true },
  yaw: { name: 'Yaw Boateng', role: 'student', verified: true },
  efua: { name: 'Efua Quansah', role: 'student', verified: true },
  kwesi: { name: 'Kwesi Arthur', role: 'student', verified: false },
  abena: { name: 'Abena Sarpong', role: 'student', verified: true },
  drEsi: { name: 'Dr. Esi Amoah', role: 'lecturer', verified: true },
  mrAddo: { name: 'Mr. Nana Addo', role: 'lecturer', verified: true },
  selorm: { name: 'Selorm Agbeko', role: 'visitor', verified: false },
} satisfies Record<string, Author>

interface Seed {
  id: string
  course: string
  by: Author
  hours: number
  body: string
  rating?: number
  score?: number
  replies?: Omit<Seed, 'course' | 'replies' | 'rating'>[]
}

const THREADS: Seed[] = [
  {
    id: 'p-mat-1',
    course: 'mat-105',
    by: A.kofi,
    hours: 30,
    rating: 4,
    score: 24,
    body: 'Do the tutorial sheets every week. Most of the exam questions look like the tutorial ones, so leaving them until revision week makes it much harder. Complex numbers and matrices come up every year.',
    replies: [
      { id: 'p-mat-1-r1', by: A.ama, hours: 26, body: 'True. The 2023 and 2024 papers both had De Moivre questions. The notes in Materials cover them well.' },
      { id: 'p-mat-1-r2', by: A.drEsi, hours: 20, score: 9, body: 'Good advice. I’d add: show every step in Cramer’s rule questions. Method marks are where most people lose points.' },
    ],
  },
  {
    id: 'p-mat-2',
    course: 'mat-105',
    by: A.selorm,
    hours: 52,
    score: 6,
    body: 'I’m not at UCC. I’m preparing for engineering school next year and following this course list. Which textbook covers the complex numbers section best?',
    replies: [
      { id: 'p-mat-2-r1', by: A.yaw, hours: 49, body: 'K.A. Stroud’s Engineering Mathematics. The library has copies and the examples are very close to what we do.' },
    ],
  },
  {
    id: 'p-mat-3',
    course: 'mat-105',
    by: A.efua,
    hours: 6,
    rating: 3,
    score: 4,
    body: 'The pace is fast after mid-sem. Limits and differentiation take only two weeks. If you struggle with the algebra, find a study group early.',
  },
  {
    id: 'p-gen103-1',
    course: 'gen-103',
    by: A.yaw,
    hours: 40,
    rating: 4,
    score: 15,
    body: 'Always draw the free-body diagram first, even when the question doesn’t ask for it. Half the marks in the ladder and incline questions come from getting the forces right.',
    replies: [
      { id: 'p-gen103-1-r1', by: A.mrAddo, hours: 35, score: 7, body: 'Exactly. I’ve added a free-body diagram sheet under Materials. Check your sign convention before you resolve forces.' },
    ],
  },
  {
    id: 'p-gen105-1',
    course: 'gen-105',
    by: A.abena,
    hours: 18,
    rating: 5,
    score: 11,
    body: 'Best Level 100 course in my opinion. The labs make Kirchhoff’s laws click. Watch the short Ohm’s law video in Materials before the first lab.',
  },
  {
    id: 'p-cms-1',
    course: 'cms-107',
    by: A.efua,
    hours: 70,
    rating: 4,
    score: 19,
    body: 'Don’t sleep on CMS. The essay question carries the most marks, and they penalise poor paragraphing. Practise summaries with a word count. Going over the limit costs you.',
    replies: [
      { id: 'p-cms-1-r1', by: A.kwesi, hours: 66, body: 'How many words for the summary question? I keep going over.' },
      { id: 'p-cms-1-r2', by: A.efua, hours: 65, body: 'Usually 80–100. Underline the main idea in each paragraph first, then write.' },
    ],
  },
  {
    id: 'p-acc-1',
    course: 'acc-101',
    by: A.ama,
    hours: 22,
    rating: 4,
    score: 13,
    body: 'If the double-entry rule doesn’t make sense yet, read the one-page notes here and do ten journal entries every day for a week. After that, the profit or loss statement questions are straightforward.',
  },
  {
    id: 'p-nur-1',
    course: 'nur-101',
    by: A.abena,
    hours: 90,
    rating: 5,
    score: 17,
    body: 'Learn the bones with flashcards and use the skeleton in the lab whenever it’s free. Section A is quick marks if you know your definitions.',
  },
  {
    id: 'p-eco-1',
    course: 'eco-101',
    by: A.kwesi,
    hours: 12,
    rating: 3,
    score: 3,
    body: 'The demand and supply diagrams are easy marks, but elasticity calculations trip people up. Practise percentage changes.',
  },
]

function toPost(seed: Omit<Seed, 'replies' | 'course'>, courseId: string, parentId: string | null): Post {
  return {
    id: seed.id,
    courseId,
    authorName: seed.by.name,
    authorRole: seed.by.role,
    authorVerified: seed.by.verified,
    body: seed.body,
    rating: 'rating' in seed ? (seed.rating ?? null) : null,
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

const PDF = 'application/pdf'

export const SAMPLE_MATERIALS: Material[] = [
  { id: 'm-mat-1', courseId: 'mat-105', kind: 'notes', title: 'Complex numbers revision guide', url: '/demo/mat105-complex-numbers-notes.pdf', mimeType: PDF, uploaderName: A.drEsi.name, createdAt: ago(100) },
  { id: 'm-mat-2', courseId: 'mat-105', kind: 'link', title: 'BSc Computer Engineering semester schedule (UCC catalogue)', url: 'https://admissions.ucc.edu.gh/catalogue/programme/bsc-computer-engineering#semester-schedule', mimeType: null, uploaderName: A.kofi.name, createdAt: ago(200) },
  { id: 'm-gen103-1', courseId: 'gen-103', kind: 'notes', title: 'Free-body diagrams: block on an incline', url: '/demo/gen103-free-body-diagrams.webp', mimeType: 'image/webp', uploaderName: A.mrAddo.name, createdAt: ago(36) },
  { id: 'm-gen105-1', courseId: 'gen-105', kind: 'video', title: 'Ohm’s law in 60 seconds', url: '/demo/gen105-ohms-law.mp4', mimeType: 'video/mp4', uploaderName: A.mrAddo.name, createdAt: ago(48) },
  { id: 'm-gen105-2', courseId: 'gen-105', kind: 'notes', title: 'Circuit laws summary (Ohm and Kirchhoff)', url: '/demo/gen105-circuit-laws-notes.pdf', mimeType: PDF, uploaderName: A.abena.name, createdAt: ago(60) },
  { id: 'm-acc-1', courseId: 'acc-101', kind: 'notes', title: 'Double entry in one page', url: '/demo/acc101-double-entry-notes.pdf', mimeType: PDF, uploaderName: A.ama.name, createdAt: ago(24) },
]

const pq = (
  id: string,
  courseId: string,
  year: number,
  examType: PastQuestion['examType'],
  file: string,
  by: Author,
  hours: number,
  mimeType = PDF,
): PastQuestion => ({ id, courseId, year, semester: 1, examType, url: `/demo/${file}`, mimeType, uploaderName: by.name, createdAt: ago(hours) })

export const SAMPLE_PAST_QUESTIONS: PastQuestion[] = [
  pq('q-mat-24', 'mat-105', 2024, 'end_of_semester', 'mat105-2024-s1.pdf', A.kofi, 80),
  pq('q-mat-24m', 'mat-105', 2024, 'mid_semester', 'mat105-2024-mid.pdf', A.efua, 120),
  pq('q-mat-23', 'mat-105', 2023, 'end_of_semester', 'mat105-2023-s1.pdf', A.yaw, 300),
  pq('q-gen103-24', 'gen-103', 2024, 'end_of_semester', 'gen103-2024-s1.pdf', A.yaw, 90),
  pq('q-cms-24', 'cms-107', 2024, 'end_of_semester', 'cms107-2024-s1.pdf', A.efua, 75),
  pq('q-cms-23', 'cms-107', 2023, 'end_of_semester', 'cms107-2023-s1-photo.webp', A.kwesi, 400, 'image/webp'),
  pq('q-acc-24', 'acc-101', 2024, 'end_of_semester', 'acc101-2024-s1.pdf', A.ama, 50),
  pq('q-nur-23', 'nur-101', 2023, 'end_of_semester', 'nur101-2023-s1.pdf', A.abena, 260),
]

const person = (id: string, a: Author, email: string, hours: number, verifiedVia: Person['verifiedVia'] = 'email'): Person => ({
  id,
  fullName: a.name,
  email,
  role: a.role,
  isVerified: a.verified,
  verifiedVia: a.verified ? verifiedVia : null,
  isModerator: false,
  emailConfirmed: true,
  createdAt: ago(hours),
})

/** Demo directory for the moderator portal, including people awaiting review. */
export const SAMPLE_PEOPLE: Person[] = [
  person('u-pending-1', { name: 'Dr. Kwame Asante', role: 'lecturer', verified: false }, 'kwame.asante.phd@gmail.com', 5),
  person('u-pending-2', { name: 'Mrs. Akosua Frimpong', role: 'lecturer', verified: false }, 'akosua.frimpong@yahoo.com', 28),
  person('u-pending-3', A.kwesi, 'kwesi.arthur22@gmail.com', 50),
  person('u-kofi', A.kofi, 'kofi.mensah@stu.ucc.edu.gh', 400),
  person('u-ama', A.ama, 'ama.owusu@stu.ucc.edu.gh', 380),
  person('u-esi', A.drEsi, 'esi.amoah@ucc.edu.gh', 900),
  person('u-addo', A.mrAddo, 'nana.addo@gmail.com', 700, 'moderator'),
  person('u-selorm', A.selorm, 'selorm.agbeko@gmail.com', 60),
]
