interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const px = { sm: 16, md: 24, lg: 40 }[size]
  return (
    <div
      className={`animate-spin rounded-full border-2 border-border-dark border-t-primary ${className}`}
      style={{ width: px, height: px }}
      role="status"
      aria-label="Cargando"
    />
  )
}
