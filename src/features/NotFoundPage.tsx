import { Compass } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export function NotFoundPage() {
  return (
    <div className="pt-safe pt-16">
      <EmptyState
        icon={Compass}
        title="Lost in orbit"
        body="That page doesn’t exist. Let’s get you back on course."
        action={
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        }
      />
    </div>
  )
}
