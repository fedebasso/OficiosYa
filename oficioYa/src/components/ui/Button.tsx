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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-opacity-90 active:bg-opacity-80',
  secondary: 'bg-bg-elevated border border-border-dark text-text-main hover:bg-border-dark active:opacity-80',
  ghost: 'text-primary bg-transparent hover:bg-bg-elevated active:opacity-80',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
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
        'inline-flex items-center justify-center font-medium transition-[transform,opacity] duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  )
}

export default Button
