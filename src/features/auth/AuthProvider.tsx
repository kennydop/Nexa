import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { backend } from '@/data/backend'
import { readAuthRedirectError } from '@/data/supabase/authErrors'
import { AuthContext, type AuthContextValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isReady, setReady] = useState(false)
  // A failed confirmation link lands here with the error in the URL: explain it and open sign-in.
  const [redirectError] = useState(() => readAuthRedirectError(window.location.hash, window.location.search))
  const [signInPrompt, setPrompt] = useState<{ open: boolean; reason: string | null }>(() => ({
    open: redirectError !== null,
    reason: null,
  }))

  useEffect(() => {
    if (!redirectError) return
    window.history.replaceState(null, '', window.location.pathname)
    toast.error(redirectError, { duration: 12_000 })
  }, [redirectError])

  useEffect(() => {
    let active = true
    backend.auth.currentUserId().then((id) => {
      if (!active) return
      setUserId(id)
      setReady(true)
    })
    const unsubscribe = backend.auth.onChange((id) => {
      setUserId(id)
      // Votes, bookmarks and the profile are per-user: refetch everything.
      client.invalidateQueries()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [client])

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => backend.repo.getProfile(),
    enabled: Boolean(userId),
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      profile: userId ? (profileQuery.data ?? null) : null,
      isReady,
      signInPrompt,
      requestSignIn: (reason) => setPrompt({ open: true, reason: reason ?? null }),
      closeSignIn: () => setPrompt({ open: false, reason: null }),
    }),
    [userId, profileQuery.data, isReady, signInPrompt],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
