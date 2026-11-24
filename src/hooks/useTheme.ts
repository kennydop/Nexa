import { useCallback, useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
const KEY = 'nexa-theme'

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  const dark =
    choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#140a12' : '#f6f1e9')
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice)

  useEffect(() => {
    apply(choice)
    if (choice !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [choice])

  const update = useCallback((next: ThemeChoice) => {
    try {
      if (next === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, next)
    } catch {
      // Preference just won't persist.
    }
    setChoice(next)
  }, [])

  return { choice, setChoice: update }
}
