import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, initials } from '@/lib/utils'

const TINTS = ['bg-ember', 'bg-sky', 'bg-violet', 'bg-mint', 'bg-gold', 'bg-rose', 'bg-lime']

function tintFor(name: string): string {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return TINTS[hash % TINTS.length]
}

interface AvatarProps {
  name: string
  src?: string | null
  className?: string
}

export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn('inline-flex size-10 shrink-0 overflow-hidden rounded-full', className)}
    >
      {src ? <AvatarPrimitive.Image src={src} alt="" className="size-full object-cover" /> : null}
      <AvatarPrimitive.Fallback
        className={cn(
          'flex size-full items-center justify-center font-display text-sm font-bold text-[#1a0e16]',
          tintFor(name),
        )}
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
