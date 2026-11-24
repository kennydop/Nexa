import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallPlatform = 'android' | 'ios' | 'other'

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent
  // iPadOS reports itself as Mac; touch support gives it away.
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const platform = detectPlatform()

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome === 'accepted'
  }, [deferred])

  return {
    platform,
    installed,
    /** Android/desktop Chrome: a native prompt is ready. */
    canPrompt: deferred !== null,
    /** iOS Safari needs manual "Add to Home Screen" steps. */
    needsManualSteps: platform === 'ios' && !installed,
    promptInstall,
  }
}
