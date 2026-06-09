interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const px = { sm: 16, md: 24, lg: 40 }[size]
  return (
    <div
      className={`animate-spin rounded-full ${className}`}
      style={{ width: px, height: px, borderWidth: 2, borderStyle: 'solid', borderColor: '#2a2a2a', borderTopColor: '#e8683a' }}
      role="status"
      aria-label="Cargando"
    />
  )
}
