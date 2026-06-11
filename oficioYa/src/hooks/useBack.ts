import { useNavigate } from 'react-router-dom'

/**
 * Volver al historial si existe, o navegar al fallback.
 * Evita que navigate(-1) salga de la app cuando no hay historial previo.
 */
export function useBack(fallback = '/') {
  const navigate = useNavigate()
  return () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }
}
