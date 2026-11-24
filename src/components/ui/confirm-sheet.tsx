import { Button } from './button'
import { Sheet } from './sheet'

interface ConfirmSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  busy?: boolean
}

/** In-app confirmation for destructive actions (no blocking browser dialogs). */
export function ConfirmSheet({ open, onOpenChange, title, body, confirmLabel, onConfirm, busy }: ConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title} description={body}>
      <div className="flex flex-col gap-2 pb-4">
        <Button variant="danger" size="lg" block onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" size="lg" block onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </Sheet>
  )
}
