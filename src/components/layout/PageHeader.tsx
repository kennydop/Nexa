import { ArrowLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title?: string
  back?: boolean
  actions?: ReactNode
}

/** Sticky compact header for pushed screens. */
export function PageHeader({ title, back = true, actions }: PageHeaderProps) {
  const navigate = useNavigate()
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'))
  return (
    <header className="pt-safe sticky top-0 z-30 -mx-5 mb-2 flex items-center gap-2 bg-bg/80 px-3 pb-2 backdrop-blur-xl">
      {back ? (
        <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} weight="bold" />
        </Button>
      ) : null}
      {title ? <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{title}</h1> : <div className="flex-1" />}
      {actions}
    </header>
  )
}
