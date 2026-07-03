// Clasificador liviano por palabras clave (modo demo). Cuando se conecte Supabase,
// el LLM de la edge function `analyze-ticket` reemplaza/enriquece esta detección.
// Fuente única de sinónimos/keywords de oficios (la usa la detección de tickets Y la
// búsqueda del Home vía `searchCategories`).

import { CATEGORY_LABELS } from './categories'

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electricista:       ['electri', 'luz', 'luces', 'tomacorriente', 'enchufe', 'tablero', 'corto', 'cortocircuito', 'foco', 'lampara', 'cable'],
  plomero:            ['plom', 'sanit', 'caño', 'agua', 'perdida', 'pérdida', 'filtracion', 'filtración', 'canilla', 'destape', 'inodoro', 'baño', 'humedad', 'cañeria', 'cañería'],
  aire_acondicionado: ['aire', 'ac', 'split', 'frio', 'frío', 'calor', 'refriger', 'no enfria', 'no enfría', 'aire acondicionado', 'climatiz'],
  cerrajero:          ['cerraj', 'llave', 'cerradura', 'porton', 'portón', 'traba', 'no abre', 'candado'],
  albanil:            ['alba', 'pared', 'fisura', 'grieta', 'mampost', 'cemento', 'revoque', 'pisos', 'ladrillo', 'construc'],
  pintor:             ['pint', 'pintar', 'color', 'barniz', 'esmalte'],
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export interface CategoryGuess {
  category: string | null
  confidence: 'high' | 'low'
  alternatives: string[]
}

const DEFAULT_ALTS = ['electricista', 'plomero', 'aire_acondicionado', 'cerrajero', 'pintor', 'albanil']

export function inferCategory(text: string): CategoryGuess {
  const t = normalize(text)
  const scored = Object.entries(CATEGORY_KEYWORDS)
    .map(([id, kws]) => ({ id, hits: kws.reduce((n, k) => (t.includes(normalize(k)) ? n + 1 : n), 0) }))
    .filter((c) => c.hits > 0)
    .sort((a, b) => b.hits - a.hits)

  if (scored.length === 0) {
    return { category: null, confidence: 'low', alternatives: DEFAULT_ALTS.slice(0, 3) }
  }

  const top = scored[0]
  const second = scored[1]
  const clear = !second || top.hits >= second.hits + 2 || scored.length === 1
  const confidence: 'high' | 'low' = clear && top.hits >= 1 ? 'high' : 'low'
  const alternatives = scored.slice(0, 3).map((c) => c.id)

  return {
    category: top.id,
    confidence,
    alternatives: alternatives.length ? alternatives : DEFAULT_ALTS.slice(0, 3),
  }
}

export interface CategoryMatch {
  id: string
  label: string
}

// Fuente única de búsqueda de oficios: matchea por label + keywords/sinónimos,
// insensible a mayúsculas y tildes, con coincidencia parcial.
export function searchCategories(query: string): CategoryMatch[] {
  const q = normalize(query.trim())
  const ids = Object.keys(CATEGORY_KEYWORDS)
  if (!q) return ids.map((id) => ({ id, label: CATEGORY_LABELS[id] ?? id }))
  return ids
    .map((id) => {
      const label = CATEGORY_LABELS[id] ?? id
      const labelHit = normalize(label).includes(q)
      // includes: matchea mientras se tipea un prefijo del keyword ("plo"→"plom").
      // startsWith: matchea cuando la query es más larga que el keyword-raíz
      // ("plomero"→"plom"). Evita q.includes(k), que daría falsos positivos con
      // keywords cortos ("ac" dentro de "reparacion").
      const kwHit = CATEGORY_KEYWORDS[id].some((k) => {
        const nk = normalize(k)
        return nk.includes(q) || q.startsWith(nk)
      })
      return { id, label, match: labelHit || kwHit, labelHit }
    })
    .filter((c) => c.match)
    .sort((a, b) => Number(b.labelHit) - Number(a.labelHit))
    .map(({ id, label }) => ({ id, label }))
}
