import {
  ChalkboardTeacher,
  Clock,
  DotsThreeVertical,
  MagnifyingGlass,
  SealCheck,
  ShieldCheck,
  ShieldSlash,
  Student,
  UserCircleMinus,
  UsersThree,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Menu } from '@/components/ui/menu'
import { Segmented } from '@/components/ui/segmented'
import { Skeleton } from '@/components/ui/skeleton'
import type { Person } from '@/data/types'
import { useDebounced } from '@/hooks/useDebounced'
import { timeAgo } from '@/lib/utils'
import { usePeople, useSetModerator, useSetVerification } from './queries'

const ROLE_LABEL = { student: 'Student', lecturer: 'Lecturer', visitor: 'Visitor' } as const
const SEARCH_DEBOUNCE_MS = 250

function Status({ person }: { person: Person }) {
  if (person.isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
        <SealCheck size={14} weight="fill" />
        {ROLE_LABEL[person.role]} · {person.verifiedVia === 'email' ? 'UCC email' : 'by moderator'}
      </span>
    )
  }
  if (person.role !== 'visitor') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-warning">
        <Clock size={14} />
        Says they’re a {ROLE_LABEL[person.role].toLowerCase()} · needs review
      </span>
    )
  }
  return <span className="text-xs font-bold text-muted">Visitor</span>
}

function PersonCard({ person }: { person: Person }) {
  const verify = useSetVerification()
  const moderator = useSetModerator()
  const name = person.fullName
  const pendingLecturer = person.role === 'lecturer' && !person.isVerified
  const set = (verified: boolean, role: Person['role']) => verify.mutate({ userId: person.id, verified, role, name })

  return (
    <li className="rounded-[22px] border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-bold">
            <span className="truncate">{name}</span>
            {person.isModerator && <ShieldCheck size={16} weight="fill" className="shrink-0 text-sky" aria-label="Moderator" />}
          </p>
          <p className="truncate text-sm text-muted">{person.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2">
            <Status person={person} />
            <span className="text-xs text-faint">joined {timeAgo(person.createdAt)}</span>
          </div>
        </div>
        <Menu
          label={`Actions for ${name}`}
          trigger={
            <Button variant="ghost" size="icon-sm">
              <DotsThreeVertical size={22} weight="bold" />
            </Button>
          }
          actions={[
            { label: 'Verify as lecturer', icon: ChalkboardTeacher, onSelect: () => set(true, 'lecturer'), hidden: person.isVerified && person.role === 'lecturer' },
            { label: 'Verify as student', icon: Student, onSelect: () => set(true, 'student'), hidden: person.isVerified && person.role === 'student' },
            { label: 'Mark as visitor', icon: UserCircleMinus, onSelect: () => set(false, 'visitor'), tone: 'danger', hidden: person.role === 'visitor' },
            { label: 'Make moderator', icon: ShieldCheck, onSelect: () => moderator.mutate({ userId: person.id, value: true, name }), hidden: person.isModerator },
            { label: 'Remove moderator', icon: ShieldSlash, onSelect: () => moderator.mutate({ userId: person.id, value: false, name }), tone: 'danger', hidden: !person.isModerator },
          ]}
        />
      </div>
      {pendingLecturer && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => set(true, 'lecturer')} disabled={verify.isPending}>
            <SealCheck size={18} weight="fill" />
            Verify lecturer
          </Button>
          <Button size="sm" variant="secondary" onClick={() => set(false, 'visitor')} disabled={verify.isPending}>
            Not a lecturer
          </Button>
        </div>
      )}
    </li>
  )
}

export function PeoplePanel() {
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<'pending' | 'all'>('pending')
  const people = usePeople(useDebounced(search, SEARCH_DEBOUNCE_MS), scope === 'pending')

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        People with a UCC email are verified automatically once they confirm it. Review everyone else who says they
        study or teach at UCC.
      </p>
      <label className="relative block">
        <MagnifyingGlass size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" aria-label="Search people" className="pl-11" />
      </label>
      <Segmented
        label="Who to show"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'pending', label: 'Needs review' },
          { value: 'all', label: 'Everyone' },
        ]}
      />
      {people.isPending ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-[22px]" />)
      ) : people.isError ? (
        <p className="rounded-2xl bg-danger/10 p-4 text-danger">Couldn’t load people. Are you still a moderator?</p>
      ) : people.data.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title={scope === 'pending' ? 'All caught up' : 'Nobody found'}
          body={scope === 'pending' ? 'Nobody is waiting for verification.' : 'Try another name or email.'}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {people.data.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </ul>
      )}
    </div>
  )
}
