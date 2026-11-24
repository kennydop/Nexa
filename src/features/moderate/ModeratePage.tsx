import { BookOpenText, ChatCircleText, FileArrowUp, ShieldCheck, UsersThree } from '@phosphor-icons/react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/context'
import { ContentPanel } from './ContentPanel'
import { CurriculumPanel } from './CurriculumPanel'
import { PeoplePanel } from './PeoplePanel'
import { UploadPanel } from './UploadPanel'

const TABS = [
  { value: 'people', label: 'People', icon: UsersThree, Panel: PeoplePanel },
  { value: 'content', label: 'Content', icon: ChatCircleText, Panel: ContentPanel },
  { value: 'upload', label: 'Upload', icon: FileArrowUp, Panel: UploadPanel },
  { value: 'curriculum', label: 'Courses', icon: BookOpenText, Panel: CurriculumPanel },
] as const

type TabValue = (typeof TABS)[number]['value']
const isTab = (value: string | null): value is TabValue => TABS.some((tab) => tab.value === value)

export function ModeratePage() {
  const { profile, isReady, requestSignIn } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = isTab(params.get('tab')) ? (params.get('tab') as TabValue) : 'people'

  if (!isReady) {
    return (
      <>
        <PageHeader title="Moderator portal" />
        <Skeleton className="h-40 rounded-[22px]" />
      </>
    )
  }

  if (!profile?.isModerator) {
    return (
      <>
        <PageHeader title="Moderator portal" />
        <EmptyState
          icon={ShieldCheck}
          title="Moderators only"
          body="This area is for Nexa moderators who verify lecturers and look after course content."
          action={profile ? undefined : <Button onClick={() => requestSignIn('Sign in with your moderator account.')}>Sign in</Button>}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Moderator portal" />
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList className="mb-4 grid grid-cols-4 gap-0 overflow-visible">
          {TABS.map(({ value, label, icon: IconCmp }) => (
            <TabsTrigger key={value} value={value} className="h-16 flex-col justify-center gap-1 px-1 text-[0.8rem]">
              <IconCmp size={22} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ value, Panel }) => (
          <TabsContent key={value} value={value}>
            <Panel />
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
