/*
 * Sample content shared by demo mode (src/data/demo/samples.ts) and the
 * Supabase seed (scripts/build-content-seed.mjs → supabase/seed-content.sql).
 * Plain data only: this file is also loaded by Node with type stripping.
 * People are fictional. `hours` = how long ago, so the content always looks fresh.
 */
export type SeedRole = 'student' | 'lecturer' | 'visitor'

export interface SeedAuthor {
  /** Stable key; also the local part of the seeded account's email. */
  key: string
  name: string
  role: SeedRole
  verified: boolean
}

export interface SeedReply {
  id: string
  by: SeedAuthor
  hours: number
  body: string
  score?: number
}

export interface SeedThread extends SeedReply {
  course: string
  /** 1–5. Each author may rate a course at most once. */
  rating?: number
  replies?: SeedReply[]
}

export interface SeedMaterial {
  id: string
  course: string
  kind: 'slides' | 'notes' | 'book' | 'video' | 'link'
  title: string
  url: string
  mimeType: string | null
  by: SeedAuthor
  hours: number
}

export interface SeedPastQuestion {
  id: string
  course: string
  year: number
  semester: 1 | 2
  examType: 'end_of_semester' | 'mid_semester' | 'quiz'
  url: string
  mimeType: string
  by: SeedAuthor
  hours: number
}

const author = (key: string, name: string, role: SeedRole, verified: boolean): SeedAuthor => ({ key, name, role, verified })

export const A = {
  kofi: author('kofi.mensah', 'Kofi Mensah', 'student', true),
  ama: author('ama.owusu', 'Ama Owusu', 'student', true),
  yaw: author('yaw.boateng', 'Yaw Boateng', 'student', true),
  efua: author('efua.quansah', 'Efua Quansah', 'student', true),
  kwesi: author('kwesi.arthur', 'Kwesi Arthur', 'student', false),
  abena: author('abena.sarpong', 'Abena Sarpong', 'student', true),
  drEsi: author('esi.amoah', 'Dr. Esi Amoah', 'lecturer', true),
  mrAddo: author('nana.addo', 'Mr. Nana Addo', 'lecturer', true),
  selorm: author('selorm.agbeko', 'Selorm Agbeko', 'visitor', false),
  akua: author('akua.darko', 'Akua Darko', 'student', true),
  kwame: author('kwame.asante', 'Kwame Asante', 'student', true),
  adwoa: author('adwoa.frimpong', 'Adwoa Frimpong', 'student', true),
  kojo: author('kojo.ansah', 'Kojo Ansah', 'student', true),
  naa: author('naa.lamptey', 'Naa Lamptey', 'student', true),
  issah: author('issah.mohammed', 'Issah Mohammed', 'student', false),
  afia: author('afia.boakye', 'Afia Boakye', 'student', false),
  drOfori: author('kwabena.ofori', 'Dr. Kwabena Ofori', 'lecturer', true),
  mrsAppiah: author('gifty.appiah', 'Mrs. Gifty Appiah', 'lecturer', true),
  profNyarko: author('comfort.nyarko', 'Prof. Comfort Nyarko', 'lecturer', true),
  drKpeglo: author('mawuena.kpeglo', 'Dr. Mawuena Kpeglo', 'lecturer', true),
  nii: author('nii.armah', 'Nii Armah', 'visitor', false),
  grace: author('grace.ofosu', 'Grace Ofosu', 'visitor', false),
}

export const THREADS: SeedThread[] = [
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

  // ── CMS 107 ──────────────────────────────────────────────────────────
  {
    id: 'p-cms-2',
    course: 'cms-107',
    by: A.mrsAppiah,
    hours: 20,
    score: 10,
    body: 'Announcement: from this week, the Thursday CMS 107 tutorial moves from the old lecture room to the Science lecture theatre (SLT). Same time, 2–4 pm. Bring your corrected essay drafts. We’ll go through paragraph unity and topic sentences.',
    replies: [
      { id: 'p-cms-2-r1', by: A.kojo, hours: 18, body: 'Thank you, madam. Noted.' },
      { id: 'p-cms-2-r2', by: A.afia, hours: 15, body: 'Please, is it for all the tutorial groups or only group B?' },
      { id: 'p-cms-2-r3', by: A.mrsAppiah, hours: 12, score: 4, body: 'All groups. The old room is being used for exams that week.' },
    ],
  },
  {
    id: 'p-cms-3',
    course: 'cms-107',
    by: A.akua,
    hours: 140,
    rating: 5,
    score: 12,
    body: 'Concord errors cost me marks in the first quiz, so here’s what I learnt. The verb agrees with the real subject, not the noun closest to it.\n\n• “The list of items is on the table.” (subject = list, not items)\n• “Each of the students has a handout.” (each = singular)\n• “Everybody wants to pass.” (everybody, anyone, nobody = singular)\n• “Mathematics is my best subject.” (looks plural, takes a singular verb)\n• “The committee has met.” (treat a group noun as one unit, especially in formal writing)\n\nWhen you edit, find the subject first, cover the “of …” phrase with your finger, and read the sentence again.',
    replies: [
      { id: 'p-cms-3-r1', by: A.kwame, hours: 130, body: 'Very helpful. What about “neither … nor”? Is it “Neither the lecturer nor the students was there” or “were there”?' },
      { id: 'p-cms-3-r2', by: A.akua, hours: 126, score: 5, body: 'Use the subject closest to the verb (the proximity rule). “Neither the lecturer nor the students were there.” But “Neither the students nor the lecturer was there.”' },
      { id: 'p-cms-3-r3', by: A.mrsAppiah, hours: 110, score: 8, body: 'Correct. One more that comes up often: “A number of students are absent” (plural) but “The number of students is small” (singular).' },
    ],
  },
  {
    id: 'p-cms-4',
    course: 'cms-107',
    by: A.issah,
    hours: 300,
    rating: 3,
    score: 5,
    body: 'Respectfully, the CMS lecture is too crowded. More than 400 of us in one hall, and if you sit at the back you can’t hear anything without the microphone. Can the department split the class?',
    replies: [
      { id: 'p-cms-4-r1', by: A.adwoa, hours: 290, body: 'Same here. I come 30 minutes early just to get a seat in the front rows.' },
      { id: 'p-cms-4-r2', by: A.kojo, hours: 280, body: 'I understand, but I don’t think the lecture is the main problem. The tutorials are small groups and that’s where the real learning happens. The lecture is mostly an overview.' },
      { id: 'p-cms-4-r3', by: A.adwoa, hours: 270, body: 'Fair point, Kojo, but not everyone can make every tutorial. Some of us have clashes with practicals, so the lecture is our only contact.' },
      { id: 'p-cms-4-r4', by: A.naa, hours: 250, score: 4, body: 'Suggestion: let’s ask the course rep to request that the slides be posted before each lecture. Then even from the back you can follow along.' },
    ],
  },
  {
    id: 'p-cms-5',
    course: 'cms-107',
    by: A.nii,
    hours: 500,
    score: 3,
    body: 'Hello. I just finished SHS and I’m waiting for admission. Is it okay if I follow the CMS discussions here to prepare? My English essays were not the best in WASSCE.',
    replies: [
      { id: 'p-cms-5-r1', by: A.mrsAppiah, hours: 480, score: 6, body: 'You’re welcome to follow along. Start with paragraph structure: one main idea per paragraph, stated in a clear topic sentence. Read a good newspaper editorial every day and notice how each paragraph is built.' },
    ],
  },
  {
    id: 'p-cms-6',
    course: 'cms-107',
    by: A.kojo,
    hours: 8,
    body: 'Please who has the 2022 CMS 107 end of semester questions?',
  },

  // ── CMS 108 ──────────────────────────────────────────────────────────
  {
    id: 'p-cms108-1',
    course: 'cms-108',
    by: A.mrsAppiah,
    hours: 400,
    score: 12,
    body: 'Formal letter format for this course (please follow it in the assignment):\n\n1. Your address at the top right (or top left in fully blocked style), followed by the date.\n2. The recipient’s title and address on the left, below yours.\n3. Salutation: “Dear Sir/Madam,” or “Dear Mr Mensah,”.\n4. A heading in capitals or underlined, e.g. APPLICATION FOR THE POST OF LIBRARY ASSISTANT.\n5. Body: introduction (why you are writing), two or three body paragraphs, conclusion (what you want done).\n6. Complimentary close and your signature, with your full name below it.\n\nIn fully blocked format, everything starts at the left margin and there is no indentation. In semi-blocked, the addresses and close are on the right and paragraphs are indented. Choose one style and be consistent.',
    replies: [
      { id: 'p-cms108-1-r1', by: A.afia, hours: 390, body: 'Madam, when do we use “Yours faithfully” and when “Yours sincerely”?' },
      { id: 'p-cms108-1-r2', by: A.mrsAppiah, hours: 385, score: 9, body: 'If you open with “Dear Sir/Madam” (you don’t know the name), close with “Yours faithfully”. If you open with the person’s name, “Dear Mrs Owusu”, close with “Yours sincerely”. Note that there is no apostrophe and no capital letter on the second word.' },
    ],
  },
  {
    id: 'p-cms108-2',
    course: 'cms-108',
    by: A.adwoa,
    hours: 220,
    rating: 4,
    score: 9,
    body: 'Summary writing method that got me 9/10 in the tutorial test:\n\n1. Read the passage twice without writing.\n2. Read the question again. Are they asking for causes, effects or reasons? Only pick those.\n3. Underline one main point per paragraph. Ignore examples, figures and quotations.\n4. Write each point as one sentence in YOUR OWN words.\n5. Count your words. Don’t go over the limit.\n\nIf the question asks for sentences, don’t write in note form.',
    replies: [
      { id: 'p-cms108-2-r1', by: A.issah, hours: 200, body: 'The “own words” part is hard. If I change the words too much, I worry that I’m changing the meaning.' },
      { id: 'p-cms108-2-r2', by: A.adwoa, hours: 196, body: 'Change the sentence structure and keep the key terms. “Deforestation reduces rainfall” can become “When forests are cut down, the area receives less rain.”' },
    ],
  },
  {
    id: 'p-cms108-3',
    course: 'cms-108',
    by: A.kwame,
    hours: 60,
    rating: 4,
    body: 'Study group for CMS 108: we meet on Saturdays at 10 am at the main library (Sam Jonah Library), ground floor reading area. We practise one essay and one summary each week and mark each other’s scripts. Everyone is welcome.',
    replies: [
      { id: 'p-cms108-3-r1', by: A.naa, hours: 55, body: 'Count me in. Can we also do comprehension once in a while?' },
      { id: 'p-cms108-3-r2', by: A.efua, hours: 50, body: 'I’ll come next Saturday. Marking someone else’s essay is the fastest way to see your own mistakes.' },
    ],
  },
  {
    id: 'p-cms108-4',
    course: 'cms-108',
    by: A.grace,
    hours: 700,
    score: 4,
    body: 'I work in an office and I’m not a student, but I want to improve my report writing. Does this course cover reports and memos? If so, what structure do you use?',
    replies: [
      { id: 'p-cms108-4-r1', by: A.kojo, hours: 690, body: 'Yes, near the end of the semester. We were taught: title, introduction (terms of reference), findings, conclusions, recommendations.' },
      { id: 'p-cms108-4-r2', by: A.mrsAppiah, hours: 650, score: 7, body: 'That’s right. For a memo, use To / From / Date / Subject at the top, with no salutation or complimentary close. Keep it to one page if you can.' },
    ],
  },
  {
    id: 'p-cms108-5',
    course: 'cms-108',
    by: A.naa,
    hours: 150,
    rating: 3,
    body: 'This is not a complaint about the lecturers, but we have had three CMS assignments in four weeks, plus assignments from our other courses. Is it possible to space them out a little?',
    replies: [
      { id: 'p-cms108-5-r1', by: A.kwame, hours: 145, body: 'Agreed. The last two were due in the same week as the ILT quiz.' },
      { id: 'p-cms108-5-r2', by: A.akua, hours: 140, body: 'I see it differently. Each one is short, and writing is a skill you only improve by practising. I’d rather have small assignments than one big one that carries all the marks.' },
      { id: 'p-cms108-5-r3', by: A.mrsAppiah, hours: 120, score: 8, body: 'Thank you for raising it politely. The short assignments are deliberate, because writing improves with regular feedback. I’ll avoid due dates in the ILT quiz week and post the full schedule for the rest of the semester.' },
      { id: 'p-cms108-5-r4', by: A.naa, hours: 110, body: 'Thank you, madam. A schedule will help a lot.' },
    ],
  },

  // ── ILT 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-ilt-1',
    course: 'ilt-101',
    by: A.drKpeglo,
    hours: 600,
    score: 12,
    body: 'APA vs Harvard: many of you are mixing the two. Both are author–date styles, and the differences are in the details.\n\nAPA 7th edition\nIn text: (Mensah, 2021) or Mensah (2021)\nReference list: Mensah, K. (2021). Information literacy in Ghanaian universities. Cape Coast University Press.\n\nHarvard (one common version)\nIn text: (Mensah 2021), with no comma\nReference list: Mensah, K. (2021) Information literacy in Ghanaian universities. Cape Coast: Cape Coast University Press.\n\nIn APA, the title is in italics and in sentence case, and the place of publication is not given. For this course, use APA unless the assignment says otherwise.',
    replies: [
      { id: 'p-ilt-1-r1', by: A.akua, hours: 580, body: 'Thank you, Doc. What happens when there are three or more authors?' },
      { id: 'p-ilt-1-r2', by: A.drKpeglo, hours: 570, score: 7, body: 'In APA 7, use the first author’s surname plus “et al.” from the first citation: (Owusu et al., 2020). In the reference list, list up to 20 authors.' },
    ],
  },
  {
    id: 'p-ilt-2',
    course: 'ilt-101',
    by: A.kojo,
    hours: 250,
    rating: 4,
    body: 'Can someone explain Boolean operators simply? The tutorial question was: find articles on malaria in children, but not in adults.',
    replies: [
      { id: 'p-ilt-2-r1', by: A.naa, hours: 240, score: 9, body: 'AND narrows (both words must appear), OR widens (either word), and NOT excludes.\n\nYour search: malaria AND (children OR child OR paediatric) NOT adults\n\nThe brackets group the synonyms together. You can also use quotation marks for exact phrases, e.g. "malaria prevention", and an asterisk for word endings: child* finds child, children and childhood.' },
      { id: 'p-ilt-2-r2', by: A.kojo, hours: 236, body: 'Ahh, the brackets were what I was missing. Thanks!' },
    ],
  },
  {
    id: 'p-ilt-3',
    course: 'ilt-101',
    by: A.akua,
    hours: 330,
    rating: 5,
    score: 11,
    body: 'The CRAAP test for evaluating sources, in a nutshell:\n\nCurrency: when was it published or updated? Is it recent enough for your topic?\nRelevance: does it actually answer your question? Who is it written for?\nAuthority: who wrote it? What are their qualifications? Who published it?\nAccuracy: is it supported by evidence? Can you verify it elsewhere?\nPurpose: why does it exist: to inform, sell, persuade or entertain? Is it biased?\n\nIn the exam they usually give you a website or an article and ask you to evaluate it using all five criteria.',
    replies: [
      { id: 'p-ilt-3-r1', by: A.issah, hours: 300, body: 'So Wikipedia fails the test automatically?' },
      { id: 'p-ilt-3-r2', by: A.drKpeglo, hours: 290, score: 6, body: 'Not automatically, but its authority is hard to establish because anyone can edit it. Don’t cite it in assignments. Use it to get an overview, then follow its references to the original sources.' },
      { id: 'p-ilt-3-r3', by: A.adwoa, hours: 280, body: 'I’d push back slightly: some of the science articles on Wikipedia are more accurate than random blogs that “pass” on currency. CRAAP is a guide, not a scoring machine.' },
      { id: 'p-ilt-3-r4', by: A.issah, hours: 260, body: 'That makes sense. Overview from Wikipedia, citations from the real sources.' },
    ],
  },
  {
    id: 'p-ilt-4',
    course: 'ilt-101',
    by: A.drKpeglo,
    hours: 30,
    score: 8,
    body: 'Reminder: the ILT quiz on Friday covers chapters 1–3 only (the information cycle, types of sources, and search strategies). It takes 30 minutes in the ICT centre. Bring your student ID card. You won’t get in without it.',
    replies: [
      { id: 'p-ilt-4-r1', by: A.afia, hours: 28, body: 'Please, Doc, will referencing be in it?' },
      { id: 'p-ilt-4-r2', by: A.drKpeglo, hours: 25, score: 3, body: 'No. Referencing is chapter 5, and it will be in the mid-sem.' },
    ],
  },
  {
    id: 'p-ilt-5',
    course: 'ilt-101',
    by: A.kwame,
    hours: 900,
    rating: 4,
    score: 9,
    body: 'If you don’t know yet: through the library portal, you can access databases like JSTOR, EBSCOhost, Emerald and ScienceDirect for free on campus Wi-Fi. Ask at the Sam Jonah Library e-resources desk for the off-campus login. It’s much better than searching Google for assignment sources.',
    replies: [
      { id: 'p-ilt-5-r1', by: A.grace, hours: 850, body: 'I’m not a student. Is there any free alternative for people outside the university?' },
      { id: 'p-ilt-5-r2', by: A.kwame, hours: 840, body: 'Try Google Scholar, DOAJ (Directory of Open Access Journals) and CORE. They’re all free and have a lot of open-access articles.' },
    ],
  },
  {
    id: 'p-ilt-6',
    course: 'ilt-101',
    by: A.afia,
    hours: 75,
    rating: 2,
    body: 'Honestly, is ILT necessary? A lot of it feels like common sense.',
    replies: [
      { id: 'p-ilt-6-r1', by: A.adwoa, hours: 70, body: 'I thought so too until I tried writing a literature review. Knowing how to search a database properly saved me hours.' },
      { id: 'p-ilt-6-r2', by: A.yaw, hours: 66, body: 'Some parts are common sense, like the library rules. But referencing and plagiarism are not. People lose marks in final year projects because of them.' },
      { id: 'p-ilt-6-r3', by: A.afia, hours: 60, body: 'Okay, I’ll give the referencing part that. The first two chapters still felt slow to me.' },
      { id: 'p-ilt-6-r4', by: A.ama, hours: 52, body: 'Fair. The early chapters are slow, but they’re easy marks in the quiz, so I didn’t complain.' },
    ],
  },
  {
    id: 'p-ilt-7',
    course: 'ilt-101',
    by: A.nii,
    hours: 1200,
    body: 'Can a visitor follow the ILT discussions? I want to learn how to do proper research before I start university.',
  },
  {
    id: 'p-ilt-8',
    course: 'ilt-101',
    by: A.naa,
    hours: 160,
    rating: 4,
    score: 6,
    body: 'About the plagiarism checker: changing a few words in a copied sentence still counts as plagiarism. Read the source, close it, write the idea from memory, then compare and cite. That’s real paraphrasing.',
    replies: [
      { id: 'p-ilt-8-r1', by: A.kojo, hours: 150, body: 'The “close it” step is the key. Thanks.' },
    ],
  },

  // ── MAT 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-mat101-1',
    course: 'mat-101',
    by: A.kwame,
    hours: 210,
    score: 5,
    body: 'Please help: solve sin 2x = cos x for 0 ≤ x ≤ 2π. I divided both sides by cos x and got sin x = 1/2, so x = π/6 and 5π/6, but the answer sheet has four answers.',
    replies: [
      { id: 'p-mat101-1-r1', by: A.akua, hours: 205, score: 10, body: 'Don’t divide by cos x, because you lose the solutions where cos x = 0. Factorise instead:\n\nsin 2x = 2 sin x cos x, so\n2 sin x cos x − cos x = 0\ncos x (2 sin x − 1) = 0\n\ncos x = 0 → x = π/2, 3π/2\nsin x = 1/2 → x = π/6, 5π/6\n\nSo x = π/6, π/2, 5π/6, 3π/2.' },
      { id: 'p-mat101-1-r2', by: A.profNyarko, hours: 190, score: 7, body: 'Well explained. General rule: never divide by an expression that can be zero. Bring everything to one side and factorise.' },
      { id: 'p-mat101-1-r3', by: A.kwame, hours: 185, body: 'Got it now. Thank you both.' },
    ],
  },
  {
    id: 'p-mat101-2',
    course: 'mat-101',
    by: A.profNyarko,
    hours: 480,
    score: 9,
    body: 'My office hours for MAT 101 are Tuesdays and Thursdays, 2–4 pm, in the Mathematics department. Come with specific questions and your attempted working. I can help much more when I can see where you got stuck.',
  },
  {
    id: 'p-mat101-3',
    course: 'mat-101',
    by: A.naa,
    hours: 130,
    rating: 5,
    score: 11,
    body: 'Logarithm laws, with one worked example:\n\nlogₐ(xy) = logₐx + logₐy\nlogₐ(x/y) = logₐx − logₐy\nlogₐ(xⁿ) = n logₐx\nlogₐa = 1, logₐ1 = 0\nChange of base: logₐx = log x / log a\n\nExample: solve log₂x + log₂(x − 2) = 3\nlog₂[x(x − 2)] = 3\nx(x − 2) = 2³ = 8\nx² − 2x − 8 = 0\n(x − 4)(x + 2) = 0\nx = 4 or x = −2\n\nReject x = −2, so x = 4.',
    replies: [
      { id: 'p-mat101-3-r1', by: A.issah, hours: 120, body: 'Why do we reject −2? It satisfies the quadratic.' },
      { id: 'p-mat101-3-r2', by: A.naa, hours: 118, score: 6, body: 'Substitute it into the original equation: log₂(−2) is undefined, because you can’t take the log of a negative number. Always check your answers in the original equation.' },
    ],
  },
  {
    id: 'p-mat101-4',
    course: 'mat-101',
    by: A.issah,
    hours: 95,
    body: 'Binomial question: find the term independent of x in the expansion of (2x − 1/x)⁶. I got 160 but my friend says −160.',
    replies: [
      { id: 'p-mat101-4-r1', by: A.adwoa, hours: 90, score: 9, body: 'General term: T₍ᵣ₊₁₎ = ⁶Cᵣ (2x)⁶⁻ʳ (−1/x)ʳ = ⁶Cᵣ · 2⁶⁻ʳ · (−1)ʳ · x⁶⁻²ʳ\n\nFor the term independent of x: 6 − 2r = 0, so r = 3.\nT₄ = ⁶C₃ · 2³ · (−1)³ = 20 × 8 × (−1) = −160.\n\nYour friend is right.' },
      { id: 'p-mat101-4-r2', by: A.issah, hours: 85, body: 'I see it. I forgot that (−1/x)³ is negative.' },
      { id: 'p-mat101-4-r3', by: A.adwoa, hours: 80, body: 'Very common mistake. Put the minus sign inside the bracket from the start and it carries through.' },
    ],
  },
  {
    id: 'p-mat101-5',
    course: 'mat-101',
    by: A.adwoa,
    hours: 340,
    rating: 4,
    score: 10,
    body: 'Sum of a geometric progression: Sₙ = a(rⁿ − 1)/(r − 1) when r > 1, or a(1 − rⁿ)/(1 − r) when r < 1. Both give the same answer.\n\nExample: find the sum of the first 8 terms of 3 + 6 + 12 + …\na = 3, r = 2, n = 8\nS₈ = 3(2⁸ − 1)/(2 − 1) = 3 × 255 = 765.',
    replies: [
      { id: 'p-mat101-5-r1', by: A.kojo, hours: 330, body: 'And the sum to infinity? Lecture notes say it only works sometimes.' },
      { id: 'p-mat101-5-r2', by: A.adwoa, hours: 320, score: 7, body: 'Only when −1 < r < 1. Then S∞ = a/(1 − r).\nExample: 9 + 3 + 1 + …, with a = 9 and r = 1/3: S∞ = 9/(1 − 1/3) = 9/(2/3) = 13.5.' },
    ],
  },
  {
    id: 'p-mat101-6',
    course: 'mat-101',
    by: A.kojo,
    hours: 45,
    body: 'Which calculator is allowed in the MAT 101 exam? Can I use my phone calculator?',
    replies: [
      { id: 'p-mat101-6-r1', by: A.profNyarko, hours: 40, score: 8, body: 'No phones. Any non-programmable scientific calculator is fine (for example, a Casio fx-82 or fx-991). Graphing and programmable calculators are not allowed.' },
      { id: 'p-mat101-6-r2', by: A.akua, hours: 36, body: 'The bookshop near the main library sells the fx-991. Buy one early and practise with it, so you don’t learn it in the exam hall.' },
    ],
  },
  {
    id: 'p-mat101-7',
    course: 'mat-101',
    by: A.nii,
    hours: 800,
    body: 'I just finished SHS and want to be ready for MAT 101 before admission. Can I follow along here? What should I revise first?',
    replies: [
      { id: 'p-mat101-7-r1', by: A.profNyarko, hours: 760, score: 6, body: 'You’re welcome. Revise indices, surds, logarithms and basic trigonometry first. Khan Academy’s Algebra 2 and Trigonometry units are free and match the start of the course well.' },
      { id: 'p-mat101-7-r2', by: A.kwame, hours: 740, body: 'Also get comfortable with factorising quadratics. It shows up everywhere.' },
    ],
  },
  {
    id: 'p-mat101-8',
    course: 'mat-101',
    by: A.akua,
    hours: 560,
    rating: 4,
    score: 7,
    body: 'Hot take: past questions alone won’t get you an A in MAT 101. They’re great for seeing the format, but the lecturer changes the questions a little every year. Do the textbook exercises first, then use past questions to practise timing.',
    replies: [
      { id: 'p-mat101-8-r1', by: A.afia, hours: 550, body: 'I don’t fully agree. Last year’s paper repeated about 60% of the question types. If time is short, past questions give the most value.' },
      { id: 'p-mat101-8-r2', by: A.kwame, hours: 540, body: 'Both are right? The question types repeat, but the numbers and twists change. If you only memorised the solutions, the twist catches you.' },
      { id: 'p-mat101-8-r3', by: A.akua, hours: 530, body: 'That’s exactly my point, Kwame. Understand the method, then practise the format.' },
      { id: 'p-mat101-8-r4', by: A.profNyarko, hours: 500, score: 9, body: 'A good discussion. Past questions are useful, but I set questions to test understanding, not memory. Work through the tutorial sheets, then attempt the past papers under timed conditions.' },
      { id: 'p-mat101-8-r5', by: A.afia, hours: 490, body: 'Okay, timed practice it is. Thanks, Prof.' },
    ],
  },
  {
    id: 'p-mat101-9',
    course: 'mat-101',
    by: A.afia,
    hours: 15,
    rating: 3,
    body: 'How do you find tan 75° without a calculator?',
    replies: [
      { id: 'p-mat101-9-r1', by: A.naa, hours: 12, score: 6, body: 'tan 75° = tan(45° + 30°) = (tan 45° + tan 30°)/(1 − tan 45° tan 30°) = (1 + 1/√3)/(1 − 1/√3) = (√3 + 1)/(√3 − 1). Rationalise: (√3 + 1)²/(3 − 1) = (4 + 2√3)/2 = 2 + √3.' },
    ],
  },

  // ── PHY 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-phy-1',
    course: 'phy-101',
    by: A.kofi,
    hours: 180,
    score: 4,
    body: 'A ball is kicked at 20 m/s at 30° above the horizontal. How do I find the range? Take g = 9.8 m/s².',
    replies: [
      { id: 'p-phy-1-r1', by: A.drOfori, hours: 170, score: 10, body: 'Use R = u² sin 2θ / g.\nR = (20)² × sin 60° / 9.8 = 400 × 0.866 / 9.8 ≈ 35.3 m.\n\nWhile you’re at it:\nTime of flight T = 2u sin θ / g = 2 × 20 × 0.5 / 9.8 ≈ 2.04 s\nMaximum height H = u² sin²θ / 2g = 400 × 0.25 / 19.6 ≈ 5.1 m\n\nThe range formula only applies when the ball lands at the same height it was launched from.' },
      { id: 'p-phy-1-r2', by: A.kofi, hours: 165, body: 'Thank you, Doc. So the maximum range is at 45°, because sin 90° = 1?' },
      { id: 'p-phy-1-r3', by: A.drOfori, hours: 160, score: 5, body: 'Yes. At 45°, R = u²/g = 400/9.8 ≈ 40.8 m. Also notice that 30° and 60° give the same range, because sin 60° = sin 120°.' },
    ],
  },
  {
    id: 'p-phy-2',
    course: 'phy-101',
    by: A.naa,
    hours: 260,
    rating: 4,
    score: 10,
    body: 'Significant figures summary, since the lab reports keep losing marks for this:\n\n• Non-zero digits always count: 4.56 has 3 s.f.\n• Zeros between digits count: 3.05 has 3 s.f.\n• Leading zeros never count: 0.00450 has 3 s.f. (the 4, the 5 and the trailing zero)\n• Trailing zeros after a decimal point count: 2.50 × 10³ has 3 s.f.\n\nMultiplying or dividing: round to the fewest s.f. 3.2 × 4.56 = 14.592 → 15 (2 s.f.)\nAdding or subtracting: round to the fewest decimal places. 12.11 + 0.3 = 12.41 → 12.4',
    replies: [
      { id: 'p-phy-2-r1', by: A.kwame, hours: 250, body: 'What about 1200? Is it 2 s.f. or 4?' },
      { id: 'p-phy-2-r2', by: A.naa, hours: 245, score: 5, body: 'It’s ambiguous. That’s why we use standard form: 1.2 × 10³ (2 s.f.) or 1.200 × 10³ (4 s.f.). Write it in standard form in your answers.' },
    ],
  },
  {
    id: 'p-phy-3',
    course: 'phy-101',
    by: A.akua,
    hours: 120,
    rating: 5,
    score: 11,
    body: 'Vectors in i, j form, worked example from the tutorial sheet:\nA = 3i + 4j, B = −i + 2j\n\nA + B = (3 − 1)i + (4 + 2)j = 2i + 6j\n|A| = √(3² + 4²) = 5\n|B| = √(1 + 4) = √5 ≈ 2.24\nA · B = (3)(−1) + (4)(2) = −3 + 8 = 5\nAngle between them: cos θ = A·B / (|A||B|) = 5 / (5√5) = 1/√5, so θ ≈ 63.4°',
    replies: [
      { id: 'p-phy-3-r1', by: A.issah, hours: 110, body: 'Nice. How do I find the direction of A + B?' },
      { id: 'p-phy-3-r2', by: A.akua, hours: 105, score: 4, body: 'tan α = j-component / i-component = 6/2 = 3, so α ≈ 71.6° above the positive x-axis. Draw a sketch first, so you know which quadrant it’s in.' },
    ],
  },
  {
    id: 'p-phy-4',
    course: 'phy-101',
    by: A.drOfori,
    hours: 70,
    score: 12,
    body: 'PHY 101 mid-semester exam details:\n• Duration: 1 hour 30 minutes\n• Covers: measurement and units, vectors, kinematics in 1D and 2D (chapters 1–4)\n• Section A has 30 multiple-choice questions. In Section B, answer 2 of 3 theory questions.\n• Bring your student ID, a non-programmable scientific calculator, a pencil and an eraser. No phones in the hall.\n\nVenue and time will be on the departmental notice board.',
    replies: [
      { id: 'p-phy-4-r1', by: A.afia, hours: 65, body: 'Please, Doc, will the formulas be provided?' },
      { id: 'p-phy-4-r2', by: A.drOfori, hours: 60, score: 6, body: 'No formula sheet. You’re expected to know the equations of motion and the projectile results. Values of constants like g will be given.' },
      { id: 'p-phy-4-r3', by: A.kojo, hours: 50, body: 'Thank you. Time to start memorising then.' },
    ],
  },
  {
    id: 'p-phy-5',
    course: 'phy-101',
    by: A.kojo,
    hours: 400,
    rating: 3,
    body: 'Polite request: the projector in the Science lecture theatre is very dim. From the middle rows, we can barely read the slides during the 8 am lecture. Can it be checked, or can the slides be uploaded before the lecture?',
    replies: [
      { id: 'p-phy-5-r1', by: A.drOfori, hours: 380, score: 7, body: 'Thanks for flagging it. I’ve reported the projector to the facilities office. From now on, I’ll upload the slides to Materials the evening before each lecture.' },
      { id: 'p-phy-5-r2', by: A.adwoa, hours: 370, body: 'Thank you, Doc. That will help a lot.' },
    ],
  },
  {
    id: 'p-phy-6',
    course: 'phy-101',
    by: A.adwoa,
    hours: 650,
    rating: 5,
    score: 8,
    body: 'YouTube channels that helped me with PHY 101: Khan Academy (one-dimensional motion and vectors), Professor Dave Explains (short concept videos), and The Organic Chemistry Tutor (lots of worked projectile problems, despite the name). Watch one video, then do the tutorial question on the same topic straight away.',
    replies: [
      { id: 'p-phy-6-r1', by: A.grace, hours: 600, body: 'I’m a working adult refreshing my physics for a night course. These are very helpful, thank you.' },
    ],
  },
  {
    id: 'p-phy-7',
    course: 'phy-101',
    by: A.issah,
    hours: 5,
    body: 'Is the physics practical a separate course from this one?',
  },
  {
    id: 'p-phy-8',
    course: 'phy-101',
    by: A.kwame,
    hours: 1000,
    rating: 4,
    score: 6,
    body: 'Debate: should we memorise the equations of motion or learn to derive them? Derivations take time in the exam.',
    replies: [
      { id: 'p-phy-8-r1', by: A.akua, hours: 980, body: 'Memorise them, but understand where they come from. v = u + at is just the definition of acceleration rearranged. If you understand that, you won’t mix up the formulas.' },
      { id: 'p-phy-8-r2', by: A.kofi, hours: 960, body: 'I just memorise them. In the exam, nobody asks you to derive them, so why spend the time?' },
      { id: 'p-phy-8-r3', by: A.kwame, hours: 950, body: 'Kofi, the 2023 paper had “Show that s = ut + ½at²” for 4 marks, so derivations do come up.' },
      { id: 'p-phy-8-r4', by: A.drOfori, hours: 900, score: 8, body: 'Both have value. Memorise the four equations so you’re fast. Also be able to derive s = ut + ½at² from the area under a velocity–time graph, because I do ask it. And remember they only hold for constant acceleration.' },
      { id: 'p-phy-8-r5', by: A.akua, hours: 880, body: 'The v–t graph method is the easiest way. Area of the rectangle (ut) plus the triangle (½at²).' },
    ],
  },
  {
    id: 'p-phy-9',
    course: 'phy-101',
    by: A.afia,
    hours: 34,
    body: 'Quick one: how do I convert 72 km/h to m/s?',
    replies: [
      { id: 'p-phy-9-r1', by: A.kojo, hours: 30, score: 3, body: '72 × 1000 m ÷ 3600 s = 20 m/s. Shortcut: divide km/h by 3.6.' },
    ],
  },

  // ── MAT 105 ──────────────────────────────────────────────────────────
  {
    id: 'p-mat-4',
    course: 'mat-105',
    by: A.kwame,
    hours: 110,
    rating: 4,
    body: 'Anyone want to practise Cramer’s rule and determinants together before the quiz? I’m in hall most evenings after 7.',
    replies: [
      { id: 'p-mat-4-r1', by: A.kojo, hours: 100, body: 'I’m in. Let’s start with 3 × 3 determinants, because that’s where I make sign errors.' },
    ],
  },
  {
    id: 'p-mat-5',
    course: 'mat-105',
    by: A.naa,
    hours: 85,
    body: 'How do I use De Moivre’s theorem to find (1 + i)⁸?',
    replies: [
      { id: 'p-mat-5-r1', by: A.yaw, hours: 80, score: 8, body: 'Write it in polar form first. |1 + i| = √2 and arg = π/4, so 1 + i = √2(cos π/4 + i sin π/4).\n(1 + i)⁸ = (√2)⁸ (cos 2π + i sin 2π) = 16(1 + 0i) = 16.' },
    ],
  },

  // ── GEN 103 ──────────────────────────────────────────────────────────
  {
    id: 'p-gen103-2',
    course: 'gen-103',
    by: A.kojo,
    hours: 140,
    rating: 4,
    body: 'Moments question: a light beam is balanced on a pivot. A 30 N weight hangs 2 m to the left. Where should a 40 N weight go on the right?',
    replies: [
      { id: 'p-gen103-2-r1', by: A.mrAddo, hours: 130, score: 6, body: 'Sum of clockwise moments = sum of anticlockwise moments about the pivot. 30 × 2 = 40 × d, so d = 1.5 m to the right.' },
    ],
  },
  {
    id: 'p-gen103-3',
    course: 'gen-103',
    by: A.afia,
    hours: 22,
    rating: 2,
    body: 'Three problem sets due in the same week as the mid-sem is a lot, please.',
  },

  // ── GEN 105 ──────────────────────────────────────────────────────────
  {
    id: 'p-gen105-2',
    course: 'gen-105',
    by: A.kwame,
    hours: 190,
    rating: 4,
    body: 'Check my working: 6 Ω and 3 Ω in parallel, then in series with 4 Ω, across a 12 V supply. What is the total current?',
    replies: [
      { id: 'p-gen105-2-r1', by: A.mrAddo, hours: 185, score: 7, body: 'Parallel: (6 × 3)/(6 + 3) = 2 Ω. Total: 2 + 4 = 6 Ω. I = V/R = 12/6 = 2 A. The voltage across the parallel pair is 2 A × 2 Ω = 4 V, so 0.67 A flows through the 6 Ω and 1.33 A through the 3 Ω.' },
      { id: 'p-gen105-2-r2', by: A.issah, hours: 175, body: 'The product-over-sum trick only works for two resistors, right?' },
    ],
  },
  {
    id: 'p-gen105-3',
    course: 'gen-105',
    by: A.grace,
    hours: 1500,
    body: 'I do house wiring as a side job and want to understand the theory properly. Can I follow this course here as a visitor?',
    replies: [
      { id: 'p-gen105-3-r1', by: A.abena, hours: 1450, body: 'Yes, anyone can read along. The Ohm’s law video and the circuit laws notes in Materials are a good start.' },
    ],
  },

  // ── CSC 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-csc-1',
    course: 'csc-101',
    by: A.kojo,
    hours: 230,
    rating: 4,
    score: 8,
    body: 'Decimal to binary: keep dividing by 2 and read the remainders from the bottom up.\n45 ÷ 2 = 22 r1\n22 ÷ 2 = 11 r0\n11 ÷ 2 = 5 r1\n5 ÷ 2 = 2 r1\n2 ÷ 2 = 1 r0\n1 ÷ 2 = 0 r1\nSo 45 = 101101₂. Check: 32 + 8 + 4 + 1 = 45.',
    replies: [
      { id: 'p-csc-1-r1', by: A.afia, hours: 220, body: 'And hexadecimal?' },
      { id: 'p-csc-1-r2', by: A.kojo, hours: 215, score: 4, body: 'Group the binary digits in fours from the right: 0010 1101 = 2D₁₆. Check: 2 × 16 + 13 = 45.' },
    ],
  },
  {
    id: 'p-csc-2',
    course: 'csc-101',
    by: A.naa,
    hours: 55,
    rating: 3,
    body: 'The computer lab is always full during practical sessions. Is it okay to bring our own laptops?',
    replies: [
      { id: 'p-csc-2-r1', by: A.kwame, hours: 50, body: 'Yes, people do. Just install the software from the course page before you come. The lab Wi-Fi is slow.' },
    ],
  },

  // ── ECO 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-eco-2',
    course: 'eco-101',
    by: A.adwoa,
    hours: 270,
    rating: 4,
    score: 9,
    body: 'Price elasticity worked example. The price rises from GH₵10 to GH₵12, and the quantity demanded falls from 100 to 80.\n\nSimple percentage method: %ΔQ = −20/100 = −20%, %ΔP = 2/10 = 20%. PED = −20% / 20% = −1 (unit elastic).\n\nMidpoint method: %ΔQ = −20/90 ≈ −0.222, %ΔP = 2/11 ≈ 0.182. PED ≈ −1.22 (elastic).\n\nCheck which method your lecturer wants, because the two methods can give different conclusions.',
    replies: [
      { id: 'p-eco-2-r1', by: A.kwesi, hours: 260, body: 'This is exactly what confused me in the quiz. Our slides use the midpoint method.' },
      { id: 'p-eco-2-r2', by: A.adwoa, hours: 255, body: 'Then use midpoint. Always state the formula in your answer too, because there are method marks for it.' },
    ],
  },
  {
    id: 'p-eco-3',
    course: 'eco-101',
    by: A.grace,
    hours: 1800,
    body: 'I work in a bank and I’m following this course to understand the economics behind interest rates and inflation. Are there any beginner-friendly book recommendations?',
  },

  // ── ACC 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-acc-2',
    course: 'acc-101',
    by: A.akua,
    hours: 310,
    rating: 5,
    score: 7,
    body: 'The accounting equation keeps everything balanced: Assets = Liabilities + Capital.\nExample: you start a business with GH₵5,000 cash (assets 5,000 = capital 5,000). Then you buy equipment worth GH₵2,000 on credit. Assets: 5,000 + 2,000 = 7,000. Liabilities: 2,000. Capital: 5,000. And 7,000 = 2,000 + 5,000.',
    replies: [
      { id: 'p-acc-2-r1', by: A.issah, hours: 300, body: 'And if the owner takes GH₵500 cash for personal use?' },
      { id: 'p-acc-2-r2', by: A.akua, hours: 295, score: 4, body: 'That’s drawings. Cash (assets) falls by 500 and capital falls by 500, so 6,500 = 2,000 + 4,500.' },
    ],
  },

  // ── NUR 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-nur-2',
    course: 'nur-101',
    by: A.adwoa,
    hours: 66,
    rating: 4,
    body: 'Anatomy study group: Wednesday evenings at the main library. This week we’re doing the upper limb bones and the muscles that attach to them. Bring your flashcards.',
    replies: [
      { id: 'p-nur-2-r1', by: A.efua, hours: 60, body: 'I’ll join. Can we quiz each other on the carpal bones? I always mix them up.' },
    ],
  },

  // ── GEN 101 ──────────────────────────────────────────────────────────
  {
    id: 'p-gen101-1',
    course: 'gen-101',
    by: A.kwame,
    hours: 420,
    rating: 4,
    score: 8,
    body: 'What to bring to Engineering Drawing: a drawing board, T-square, 45° and 30°/60° set squares, a good compass, 2H and HB pencils (or 0.5 mm clutch pencils), an eraser, masking tape and A3 sheets. Buy them in the first week, because they sell out.',
    replies: [
      { id: 'p-gen101-1-r1', by: A.mrAddo, hours: 410, score: 5, body: 'Good list. Add a protractor and a scale rule. Use 2H for construction lines and HB for the final outlines.' },
      { id: 'p-gen101-1-r2', by: A.kojo, hours: 400, body: 'Is a mini drafter necessary, or is a T-square enough?' },
    ],
  },
  {
    id: 'p-gen101-2',
    course: 'gen-101',
    by: A.issah,
    hours: 140,
    body: 'What is the difference between first angle and third angle projection? I keep mixing them up.',
    replies: [
      { id: 'p-gen101-2-r1', by: A.mrAddo, hours: 130, score: 7, body: 'In first angle projection, the plan goes BELOW the front view and the left end view goes on the RIGHT. In third angle projection, the plan goes ABOVE the front view and the left end view goes on the LEFT. Always draw the projection symbol in the title block so the reader knows which one you used.' },
    ],
  },
]

const PDF = 'application/pdf'
const S = '/samples/'

export const MATERIALS: SeedMaterial[] = [
  { id: 'm-mat-1', course: 'mat-105', kind: 'notes', title: 'Complex numbers revision guide', url: `${S}mat105-complex-numbers-notes.pdf`, mimeType: PDF, by: A.drEsi, hours: 100 },
  { id: 'm-mat-2', course: 'mat-105', kind: 'link', title: 'BSc Computer Engineering semester schedule (UCC catalogue)', url: 'https://admissions.ucc.edu.gh/catalogue/programme/bsc-computer-engineering#semester-schedule', mimeType: null, by: A.kofi, hours: 200 },
  { id: 'm-gen103-1', course: 'gen-103', kind: 'notes', title: 'Free-body diagrams: block on an incline', url: `${S}gen103-free-body-diagrams.webp`, mimeType: 'image/webp', by: A.mrAddo, hours: 36 },
  { id: 'm-gen105-1', course: 'gen-105', kind: 'video', title: 'Ohm’s law in 60 seconds', url: `${S}gen105-ohms-law.mp4`, mimeType: 'video/mp4', by: A.mrAddo, hours: 48 },
  { id: 'm-gen105-2', course: 'gen-105', kind: 'notes', title: 'Circuit laws summary (Ohm and Kirchhoff)', url: `${S}gen105-circuit-laws-notes.pdf`, mimeType: PDF, by: A.abena, hours: 60 },
  { id: 'm-acc-1', course: 'acc-101', kind: 'notes', title: 'Double entry in one page', url: `${S}acc101-double-entry-notes.pdf`, mimeType: PDF, by: A.ama, hours: 24 },
]

const pq = (
  id: string,
  course: string,
  year: number,
  examType: SeedPastQuestion['examType'],
  file: string,
  by: SeedAuthor,
  hours: number,
  mimeType = PDF,
): SeedPastQuestion => ({ id, course, year, semester: 1, examType, url: `${S}${file}`, mimeType, by, hours })

export const PAST_QUESTIONS: SeedPastQuestion[] = [
  pq('q-mat-24', 'mat-105', 2024, 'end_of_semester', 'mat105-2024-s1.pdf', A.kofi, 80),
  pq('q-mat-24m', 'mat-105', 2024, 'mid_semester', 'mat105-2024-mid.pdf', A.efua, 120),
  pq('q-mat-23', 'mat-105', 2023, 'end_of_semester', 'mat105-2023-s1.pdf', A.yaw, 300),
  pq('q-gen103-24', 'gen-103', 2024, 'end_of_semester', 'gen103-2024-s1.pdf', A.yaw, 90),
  pq('q-cms-24', 'cms-107', 2024, 'end_of_semester', 'cms107-2024-s1.pdf', A.efua, 75),
  pq('q-cms-23', 'cms-107', 2023, 'end_of_semester', 'cms107-2023-s1-photo.webp', A.kwesi, 400, 'image/webp'),
  pq('q-acc-24', 'acc-101', 2024, 'end_of_semester', 'acc101-2024-s1.pdf', A.ama, 50),
  pq('q-nur-23', 'nur-101', 2023, 'end_of_semester', 'nur101-2023-s1.pdf', A.abena, 260),
]
