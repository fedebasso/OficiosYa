import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#E8683A', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(232,104,58,.25)' },
  secondary: { background: '#F5F0E8', color: '#111111', border: '1.5px solid #E8E0D4' },
  ghost:     { background: 'transparent', color: '#E8683A' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 12px',  fontSize: 'var(--text-sm)',  borderRadius: 12, minHeight: 44 },
  md: { padding: '10px 16px', fontSize: 'var(--text-base)', borderRadius: 12, minHeight: 44 },
  lg: { padding: '12px 24px', fontSize: 'var(--text-lg)',  borderRadius: 16, minHeight: 48 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-bold transition-[transform,opacity] duration-150 active:scale-[0.97] active:opacity-80 focus:outline-none',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      style={{ ...variantStyles[variant], ...sizeStyles[size] }}
    >
      {children}
    </button>
  )
}

export default Button
