import { BookmarkSimple, Compass, House, MagnifyingGlass, UserCircle, type Icon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

interface Tab {
  to: string
  label: string
  icon: Icon
  end?: boolean
}

const TABS: Tab[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/search', label: 'Search', icon: MagnifyingGlass },
  { to: '/saved', label: 'Saved', icon: BookmarkSimple },
  { to: '/me', label: 'Me', icon: UserCircle },
]

/** Floating glass tab bar, the app's primary navigation. */
export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
    >
      <ul className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-[26px] border border-line bg-surface/80 p-1.5 shadow-float backdrop-blur-xl backdrop-saturate-150">
        {TABS.map(({ to, label, icon: IconCmp, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-[20px] text-[0.7rem] font-bold transition-colors duration-150',
                  isActive ? 'text-brand-ink' : 'text-muted hover:text-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-[20px] bg-brand"
                      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    />
                  )}
                  <IconCmp size={24} weight={isActive ? 'fill' : 'duotone'} className="relative" />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
