import { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useNavDirection(): 'forward' | 'back' {
  const location = useLocation()
  const prevIdx = useRef<number>(window.history.state?.idx ?? 0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  useEffect(() => {
    const currentIdx = window.history.state?.idx ?? 0
    setDirection(currentIdx >= prevIdx.current ? 'forward' : 'back')
    prevIdx.current = currentIdx
  }, [location.key])

  return direction
}
