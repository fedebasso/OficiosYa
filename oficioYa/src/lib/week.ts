/** Lunes 00:00 (hora local) de la semana que contiene a `d`. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()            // domingo = 0
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Fecha local en formato YYYY-MM-DD (no usa toISOString para evitar el corrimiento por UTC). */
export function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 7 fechas L→D para la semana con el offset dado (0 = actual, -1 = anterior). */
export function weekDatesFor(weekOffset: number): string[] {
  const monday = addDays(startOfWeek(new Date()), weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => toYMD(addDays(monday, i)))
}
