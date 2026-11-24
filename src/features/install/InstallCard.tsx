import { DeviceMobile, Export, PlusSquare } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { APP_NAME } from '@/lib/brand'

const IOS_STEPS = [
  { icon: Export, text: 'Tap the Share button in Safari’s toolbar.' },
  { icon: PlusSquare, text: 'Scroll down and choose “Add to Home Screen”.' },
  { icon: DeviceMobile, text: `Tap “Add”. ${APP_NAME} opens full-screen like any other app.` },
]

/** Offers installation: the native prompt on Android, guided steps on iOS. */
export function InstallCard() {
  const { installed, canPrompt, needsManualSteps, promptInstall } = useInstallPrompt()
  const [showSteps, setShowSteps] = useState(false)
  if (installed || (!canPrompt && !needsManualSteps)) return null

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-plum p-5 text-[#f7eee6]">
      <div aria-hidden className="absolute -right-10 -bottom-12 size-40 rounded-full bg-brand/30 blur-2xl" />
      <img src="/icons/pwa-192.png" alt="" width={52} height={52} className="relative mb-3 rounded-[14px]" />
      <h2 className="relative text-xl font-bold">Put {APP_NAME} on your home screen</h2>
      <p className="relative mt-1 text-sm text-[#f7eee6]/75">
        Opens instantly, works with patchy campus Wi-Fi, and keeps the files you have opened.
      </p>
      <Button
        className="relative mt-4"
        onClick={() => (canPrompt ? promptInstall() : setShowSteps(true))}
      >
        Install app
      </Button>
      <Sheet open={showSteps} onOpenChange={setShowSteps} title="Install on iPhone" description="Three taps in Safari.">
        <ol className="flex flex-col gap-3 pb-6">
          {IOS_STEPS.map(({ icon: IconCmp, text }, i) => (
            <li key={text} className="flex items-center gap-4 rounded-[20px] bg-surface-2 p-4">
              <span className="font-display text-2xl font-extrabold text-brand">{i + 1}</span>
              <IconCmp size={28} className="shrink-0 text-text" />
              <span className="text-[0.95rem]">{text}</span>
            </li>
          ))}
        </ol>
      </Sheet>
    </section>
  )
}
