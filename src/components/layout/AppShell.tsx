import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/context'
import { TabBar } from './TabBar'

const SignInSheet = lazy(() => import('@/features/auth/SignInSheet').then((m) => ({ default: m.SignInSheet })))

export function AppShell() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const { signInPrompt } = useAuth()
  const [signInLoaded, setSignInLoaded] = useState(false)
  if (signInPrompt.open && !signInLoaded) setSignInLoaded(true)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="atmosphere relative min-h-dvh">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-lg px-5 pb-32"
        >
          <Suspense fallback={<div className="min-h-dvh" />}>
            <Outlet />
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <TabBar />
      {/* Loaded on first request; stays mounted so the sheet can animate closed. */}
      <Suspense>{signInLoaded ? <SignInSheet /> : null}</Suspense>
    </div>
  )
}
