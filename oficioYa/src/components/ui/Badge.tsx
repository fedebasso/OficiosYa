import type { ReactNode } from 'react'

type BadgeVariant = 'verified' | 'pending' | 'accepted' | 'completed' | 'rejected'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  verified: 'bg-accent text-primary',
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default Badge
