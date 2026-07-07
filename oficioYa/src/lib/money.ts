const UYU = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
})

/** Formatea pesos uruguayos sin decimales. Entradas inválidas → $ 0. */
export function formatUYU(n: number): string {
  const safe = Number.isFinite(n) ? Math.round(n) : 0
  return UYU.format(safe)
}
