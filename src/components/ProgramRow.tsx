import { GraduationCap } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { Program } from '@/data/types'

export function ProgramRow({ program }: { program: Program }) {
  return (
    <Link
      to={`/program/${program.id}`}
      className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition-colors duration-150 hover:bg-surface-2 active:bg-surface-3"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-brand">
        <GraduationCap size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-snug">{program.name}</span>
        <span className="text-sm text-muted">
          {program.degree} · {program.awardLevel === 'postgraduate' ? 'Postgraduate' : program.awardLevel === 'diploma' ? 'Diploma' : 'Undergraduate'}
        </span>
      </span>
    </Link>
  )
}
