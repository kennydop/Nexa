import { MagnifyingGlass } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { searchPrograms } from '@/data/search'
import type { Program } from '@/data/types'
import { usePrograms } from '@/hooks/queries'

const VISIBLE = 40

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (program: Program) => void
  title?: string
}

export function ProgramPickerSheet({ open, onOpenChange, onPick, title = 'Your programme' }: Props) {
  const programs = usePrograms({})
  const [query, setQuery] = useState('')
  const list = useMemo(() => {
    const all = programs.data ?? []
    return (query.trim().length >= 2 ? searchPrograms(all, query) : all).slice(0, VISIBLE)
  }, [programs.data, query])

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <label className="relative mb-3 block">
        <MagnifyingGlass size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 500+ programmes"
          aria-label="Search programmes"
          className="pl-11"
        />
      </label>
      <ul className="-mx-2 min-h-[50dvh] pb-6">
        {list.map((program) => (
          <li key={program.id}>
            <button
              type="button"
              onClick={() => onPick(program)}
              className="w-full rounded-2xl px-3 py-3 text-left transition-colors hover:bg-surface-2"
            >
              <span className="block font-bold">{program.name}</span>
              <span className="text-sm text-muted">{program.degree}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
