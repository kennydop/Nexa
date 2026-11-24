import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { backend } from '@/data/backend'
import type { ContentKind, ContentStatus, CurriculumCourseInput, Program, ProgramInput, UserRole } from '@/data/types'
import { errorMessage } from '@/lib/utils'

const { moderation } = backend

export const usePeople = (search: string, onlyPending: boolean) =>
  useQuery({
    queryKey: ['mod', 'people', search, onlyPending],
    queryFn: () => moderation.listPeople(search, onlyPending),
    placeholderData: (previous) => previous,
  })

export const useModerationFeed = () =>
  useQuery({ queryKey: ['mod', 'content'], queryFn: () => moderation.listContent() })

/** Shared success/error handling; refreshes moderator lists and public views. */
function useModAction<TVars, TResult = void>(run: (vars: TVars) => Promise<TResult>, success: (vars: TVars) => string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: async (_data, vars) => {
      toast.success(success(vars))
      await client.invalidateQueries()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export const useSetVerification = () =>
  useModAction(
    (v: { userId: string; verified: boolean; role: UserRole; name: string }) =>
      moderation.setVerification(v.userId, v.verified, v.role),
    (v) => (v.verified ? `${v.name} verified as ${v.role}` : `${v.name} is no longer verified`),
  )

export const useSetModerator = () =>
  useModAction(
    (v: { userId: string; value: boolean; name: string }) => moderation.setModerator(v.userId, v.value),
    (v) => (v.value ? `${v.name} is now a moderator` : `${v.name} is no longer a moderator`),
  )

export const useSetContentStatus = () =>
  useModAction(
    (v: { kind: ContentKind; id: string; status: ContentStatus }) => moderation.setContentStatus(v.kind, v.id, v.status),
    (v) => (v.status === 'hidden' ? 'Hidden from everyone' : 'Visible again'),
  )

export const useDeleteContent = () =>
  useModAction(
    (v: { kind: ContentKind; id: string }) => moderation.deleteContent(v.kind, v.id),
    () => 'Deleted',
  )

export const useAddCurriculumCourse = () =>
  useModAction(
    (input: CurriculumCourseInput) => moderation.addCurriculumCourse(input),
    (input) => `Added ${input.code.toUpperCase()} to Level ${input.level}`,
  )

export const useRemoveCurriculumCourse = () =>
  useModAction(
    (v: { programId: string; courseId: string; code: string }) => moderation.removeCurriculumCourse(v.programId, v.courseId),
    (v) => `Removed ${v.code}`,
  )

export const useAddProgram = () =>
  useModAction<ProgramInput, Program>(
    (input) => moderation.addProgram(input),
    (input) => `Created ${input.name.trim()}`,
  )
