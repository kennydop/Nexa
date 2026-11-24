import {
  BookBookmark,
  FileText,
  LinkSimple,
  PresentationChart,
  YoutubeLogo,
  type Icon,
} from '@phosphor-icons/react'
import type { ExamType, MaterialKind } from '@/data/types'

export const KIND_META: Record<MaterialKind, { label: string; icon: Icon; tint: string }> = {
  slides: { label: 'Slides', icon: PresentationChart, tint: 'bg-ember/15 text-ember' },
  notes: { label: 'Notes', icon: FileText, tint: 'bg-sky/15 text-sky' },
  book: { label: 'Book', icon: BookBookmark, tint: 'bg-violet/15 text-violet' },
  video: { label: 'Video', icon: YoutubeLogo, tint: 'bg-rose/15 text-rose' },
  link: { label: 'Link', icon: LinkSimple, tint: 'bg-mint/15 text-mint' },
}

export const EXAM_LABEL: Record<ExamType, string> = {
  end_of_semester: 'End of semester',
  mid_semester: 'Mid-semester',
  quiz: 'Quiz',
}
