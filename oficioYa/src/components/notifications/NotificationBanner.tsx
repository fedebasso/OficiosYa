import { useNotificationStore } from '../../store/notificationStore'

interface Props {
  message: string
}

export function NotificationBanner({ message }: Props) {
  const { permission, bannerDismissed, requestPermission, dismissBanner } = useNotificationStore()

  if (permission !== 'default' || bannerDismissed) return null

  return (
    <div
      className="flex items-center gap-3 mx-4 mb-3"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DE',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>🔔</span>
      <p
        className="flex-1"
        style={{ fontSize: 'var(--text-sm)', color: '#444444', lineHeight: 1.4 }}
      >
        {message}
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={dismissBanner}
          style={{
            fontSize: 'var(--text-sm)',
            color: '#AAAAAA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
          }}
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={requestPermission}
          className="font-bold"
          style={{
            fontSize: 'var(--text-sm)',
            color: '#FFFFFF',
            background: '#0F6E56',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Activar
        </button>
      </div>
    </div>
  )
}
