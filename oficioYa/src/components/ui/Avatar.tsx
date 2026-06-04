type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const initials = getInitials(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
        ].join(' ')}
      />
    )
  }

  return (
    <div
      className={[
        'rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0',
        sizeClasses[size],
      ].join(' ')}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

export default Avatar
