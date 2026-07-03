import { useEffect } from 'react'

/**
 * Mantiene la variable CSS `--kb-inset` con la altura del teclado virtual
 * (usando la Visual Viewport API). Los inputs pegados al teclado usan
 * `padding-bottom: var(--kb-inset, 0px)` para quedar justo encima.
 *
 * Se monta una vez a nivel app. Si el navegador no soporta visualViewport,
 * `--kb-inset` queda en 0 y todo funciona con el safe-area normal.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const onResize = () => {
      const inset = window.innerHeight - vv.height - vv.offsetTop
      document.documentElement.style.setProperty('--kb-inset', `${Math.max(0, inset)}px`)
    }

    onResize()
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
      document.documentElement.style.removeProperty('--kb-inset')
    }
  }, [])
}
