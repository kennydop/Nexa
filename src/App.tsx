import { IconContext } from '@phosphor-icons/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { HomePage } from '@/features/home/HomePage'
import { useTheme } from '@/hooks/useTheme'

// Home ships in the main bundle; every other screen loads on first visit.
const CoursePage = lazy(() => import('@/features/course/CoursePage').then((m) => ({ default: m.CoursePage })))
const CollegePage = lazy(() => import('@/features/explore/CollegePage').then((m) => ({ default: m.CollegePage })))
const ExplorePage = lazy(() => import('@/features/explore/ExplorePage').then((m) => ({ default: m.ExplorePage })))
const MePage = lazy(() => import('@/features/profile/MePage').then((m) => ({ default: m.MePage })))
const ProgramPage = lazy(() => import('@/features/program/ProgramPage').then((m) => ({ default: m.ProgramPage })))
const SavedPage = lazy(() => import('@/features/saved/SavedPage').then((m) => ({ default: m.SavedPage })))
const SearchPage = lazy(() => import('@/features/search/SearchPage').then((m) => ({ default: m.SearchPage })))
const ModeratePage = lazy(() => import('@/features/moderate/ModeratePage').then((m) => ({ default: m.ModeratePage })))
const PlansPage = lazy(() => import('@/features/plans/PlansPage').then((m) => ({ default: m.PlansPage })))
const NotFoundPage = lazy(() => import('@/features/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
})

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/college/:collegeId', element: <CollegePage /> },
      { path: '/program/:programId', element: <ProgramPage /> },
      { path: '/course/:courseId', element: <CoursePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/me', element: <MePage /> },
      { path: '/moderate', element: <ModeratePage /> },
      { path: '/plans', element: <PlansPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function ThemedToaster() {
  const { choice } = useTheme()
  return <Toaster position="top-center" theme={choice} richColors offset={16} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IconContext.Provider value={{ weight: 'duotone' }}>
          <RouterProvider router={router} />
          <ThemedToaster />
        </IconContext.Provider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
