import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { backend } from '@/data/backend'
import type { NewMaterial, NewPastQuestion, NewPost, PostSort } from '@/data/repository'
import type { Post } from '@/data/types'

const { repo } = backend
const HOUR = 60 * 60 * 1000

/* ---------- Catalogue (rarely changes: cache aggressively) ---------- */
export const useColleges = () =>
  useQuery({ queryKey: ['colleges'], queryFn: () => repo.listColleges(), staleTime: HOUR })

export const useDepartments = (collegeId: string) =>
  useQuery({ queryKey: ['departments', collegeId], queryFn: () => repo.listDepartments(collegeId), staleTime: HOUR })

export const usePrograms = (filter: { collegeId?: string; departmentId?: string }) =>
  useQuery({ queryKey: ['programs', filter], queryFn: () => repo.listPrograms(filter), staleTime: HOUR })

export const useProgram = (id: string | null | undefined) =>
  useQuery({
    queryKey: ['program', id],
    queryFn: () => repo.getProgram(id as string),
    enabled: Boolean(id),
    staleTime: HOUR,
  })

export const useCurriculum = (programId: string | null | undefined) =>
  useQuery({
    queryKey: ['curriculum', programId],
    queryFn: () => repo.getCurriculum(programId as string),
    enabled: Boolean(programId),
    staleTime: HOUR,
  })

export const useCourse = (id: string) =>
  useQuery({ queryKey: ['course', id], queryFn: () => repo.getCourse(id), staleTime: HOUR })

export const useSearch = (query: string) =>
  useQuery({
    queryKey: ['search', query],
    queryFn: () => repo.search(query),
    enabled: query.trim().length >= 2,
    placeholderData: (previous) => previous,
  })

/* ---------- Course activity ---------- */
export const useCourseStats = (id: string) =>
  useQuery({ queryKey: ['course-stats', id], queryFn: () => repo.getCourseStats(id) })

export const useMaterials = (courseId: string) =>
  useQuery({ queryKey: ['materials', courseId], queryFn: () => repo.listMaterials(courseId) })

export const usePastQuestions = (courseId: string) =>
  useQuery({ queryKey: ['past-questions', courseId], queryFn: () => repo.listPastQuestions(courseId) })

export const usePosts = (courseId: string, sort: PostSort) =>
  useQuery({ queryKey: ['posts', courseId, sort], queryFn: () => repo.listPosts(courseId, sort) })

export const useReplies = (parentId: string, enabled: boolean) =>
  useQuery({ queryKey: ['replies', parentId], queryFn: () => repo.listReplies(parentId), enabled })

function useInvalidateCourse() {
  const client = useQueryClient()
  return (courseId: string, keys: string[]) =>
    Promise.all([
      ...keys.map((key) => client.invalidateQueries({ queryKey: [key, courseId] })),
      client.invalidateQueries({ queryKey: ['course-stats', courseId] }),
    ])
}

export function useAddMaterial() {
  const invalidate = useInvalidateCourse()
  return useMutation({
    mutationFn: (input: NewMaterial) => repo.addMaterial(input),
    onSuccess: (_data, input) => invalidate(input.courseId, ['materials']),
  })
}

export function useAddPastQuestion() {
  const invalidate = useInvalidateCourse()
  return useMutation({
    mutationFn: (input: NewPastQuestion) => repo.addPastQuestion(input),
    onSuccess: (_data, input) => invalidate(input.courseId, ['past-questions']),
  })
}

export function useAddPost() {
  const client = useQueryClient()
  const invalidate = useInvalidateCourse()
  return useMutation({
    mutationFn: (input: NewPost) => repo.addPost(input),
    onSuccess: async (_data, input) => {
      if (input.parentId) await client.invalidateQueries({ queryKey: ['replies', input.parentId] })
      await invalidate(input.courseId, ['posts'])
    },
  })
}

function applyVote(post: Post, postId: string, value: -1 | 0 | 1): Post {
  if (post.id !== postId) return post
  return { ...post, score: post.score - post.myVote + value, myVote: value }
}

/** Optimistic voting: update every cached list, roll back on failure. */
export function useVote(courseId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: -1 | 0 | 1 }) => repo.vote(postId, value),
    onMutate: async ({ postId, value }) => {
      const filters = { predicate: (q: { queryKey: readonly unknown[] }) => ['posts', 'replies'].includes(q.queryKey[0] as string) }
      await client.cancelQueries(filters)
      const snapshot = client.getQueriesData<Post[]>(filters)
      snapshot.forEach(([key, posts]) => {
        if (posts) client.setQueryData(key, posts.map((post) => applyVote(post, postId, value)))
      })
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      context?.snapshot.forEach(([key, posts]) => client.setQueryData(key, posts))
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['posts', courseId] }),
  })
}

/* ---------- Saved courses ---------- */
export const useBookmarks = (enabled: boolean) =>
  useQuery({ queryKey: ['bookmarks'], queryFn: () => repo.listBookmarks(), enabled })

export const useIsBookmarked = (courseId: string, enabled: boolean) =>
  useQuery({ queryKey: ['bookmark', courseId], queryFn: () => repo.isBookmarked(courseId), enabled })

export function useSetBookmark(courseId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (saved: boolean) => repo.setBookmark(courseId, saved),
    onMutate: (saved) => {
      const previous = client.getQueryData<boolean>(['bookmark', courseId])
      client.setQueryData(['bookmark', courseId], saved)
      return { previous }
    },
    onError: (_error, _saved, context) => client.setQueryData(['bookmark', courseId], context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: ['bookmarks'] }),
  })
}
