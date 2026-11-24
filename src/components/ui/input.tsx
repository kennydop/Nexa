import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentProps, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-2xl border border-line bg-surface-2 px-4 text-[0.95rem] text-text placeholder:text-faint transition-colors duration-150 focus:border-brand focus:bg-surface focus:outline-none aria-invalid:border-danger'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-12', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-28 resize-none py-3 leading-relaxed', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn('text-sm font-semibold text-muted', className)} {...props} />
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-faint">{hint}</p>
      ) : null}
    </div>
  )
}
