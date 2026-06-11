import type { ReactNode } from 'react'

type BadgeVariant = 'verified' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  verified:    { background: '#FEF0EA', color: '#E8683A', border: '1px solid #FDDCC8' },
  pending:     { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
  confirmed:   { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' },
  in_progress: { background: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE' },
  completed:   { background: '#DBEAFE', color: '#2563EB', border: '1px solid #BFDBFE' },
  cancelled:   { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}

export default Badge
