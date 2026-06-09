import type { ReactNode } from 'react'

type BadgeVariant = 'verified' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  verified: 'bg-[rgba(59,130,246,.1)] text-[#60a5fa]',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-[rgba(232,104,58,.1)] text-[#e8683a]',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
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
