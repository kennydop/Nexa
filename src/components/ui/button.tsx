import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 font-semibold transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-brand-ink shadow-[0_8px_20px_-8px_var(--brand)] hover:bg-brand-strong',
        secondary: 'bg-surface-2 text-text hover:bg-surface-3',
        outline: 'border border-line-strong bg-transparent text-text hover:bg-surface-2',
        ghost: 'bg-transparent text-text hover:bg-surface-2',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 rounded-full px-3.5 text-sm',
        md: 'h-11 rounded-full px-5 text-[0.95rem]',
        lg: 'h-14 rounded-[18px] px-6 text-base',
        icon: 'size-11 rounded-full',
        'icon-sm': 'size-9 rounded-full',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, block, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  )
}
