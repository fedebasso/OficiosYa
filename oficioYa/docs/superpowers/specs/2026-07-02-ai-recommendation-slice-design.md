# IA integrada — Camino de recomendación (slice 1) — Design Spec

## Objetivo

Mejorar el camino "IA" del flujo de ticket para que: (1) el cliente pueda **describir
su problema primero** y la IA **detecte el oficio** aunque no sepa nombrarlo; (2) si es
ambiguo, la app lo **acompañe** con una pregunta corta; (3) recomiende profesionales
por un **matching que pondera especialización + geo + rating + trabajos**; (4) muestre
**por qué** recomienda a cada uno. Todo con el **lenguaje visual premium** actual. El
camino manual (búsqueda) queda como está y convive con el de IA.

Nota: la conversación IA "profunda" (entender lenguaje libre real) vive en la Supabase
Edge Function `analyze-ticket` (LLM). En **modo demo** este slice usa un **clasificador
por reglas** (palabras clave) que se siente asistido y funciona sin backend; cuando se
conecte Supabase, el LLM reemplaza/enriquece la detección.

---

## Lenguaje visual (premium, ya establecido)

- Base crema `#F5F0E8`, cards `#FFFFFF`, texto `#1A1712`/`#7A6E5E`/`#B3A794`.
- Sombra premium: `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`.
- Borde card `1px solid #ECE6DC`, radios 16-20.
- Naranja acento `#D4571F`/`#E8683A`; verde verificado `#22A559`; estrella `#F5A623`.
- **Íconos lucide** (nada de emojis). Categorías con `getCategoryIcon`.
- Chips: fondo `#FAF6F0`, borde `#ECE4D8`, ícono naranja.

---

## 1. Dos caminos

- **Manual:** búsqueda + categorías (existente, sin cambios).
- **IA:** el card "Describí tu problema" (`TicketEntryCard`) entra al flujo asistido.
- En la **pantalla de resultados de la IA** siempre hay un enlace secundario
  **"¿Preferís elegir vos?"** → navega a `/buscar`. Así conviven sin fricción.

---

## 2. Clasificador de oficio (nuevo)

`src/lib/inferCategory.ts`:
```ts
export interface CategoryGuess {
  category: string | null          // mejor candidato, o null si nada matchea
  confidence: 'high' | 'low'       // high si hay match claro y único
  alternatives: string[]           // hasta 3 categorías candidatas (incluye la mejor)
}
export function inferCategory(text: string): CategoryGuess
```
- Centraliza los sets de keywords por categoría (los mismos que hoy usa
  `Search.tsx` en `AUTOCOMPLETE_CATEGORIES`; se mueven acá y Search los reutiliza para
  no duplicar — DRY).
- Lógica: normaliza el texto, cuenta matches de keywords por categoría, ordena.
  - `high` si la categoría top tiene matches y saca ventaja clara sobre la 2ª (o es la
    única con matches).
  - `low` si hay empate/varias candidatas o ninguna con match fuerte.
- `alternatives`: top 3 por cantidad de matches (o, si no hay ninguno, un set por
  defecto de las 6 categorías cliente).

---

## 3. TicketFlow — reorden "describir primero" + desambiguación

Archivo: `src/pages/TicketFlow.tsx` (reordenar pasos; sin cambiar la lógica de crear
la solicitud ni `analyzeTicket`).

Pasos nuevos:
1. **Describir** (era paso 2): texto libre + foto opcional + zona. Copy: "Contanos qué
   está pasando". Sin grid de categoría al inicio. Botón "Analizar con IA" (sin ✨,
   con ícono `Sparkles` de lucide).
2. **Desambiguación (condicional):** al enviar, correr `inferCategory(text)`.
   - `high` → saltar directo a "Procesando".
   - `low` → mostrar paso corto **"¿Qué es lo que te pasa?"** con los `alternatives`
     como chips (ícono lucide + label). El usuario toca uno → esa es la categoría.
     También un chip "Otro / no estoy seguro" que usa la mejor conjetura o abre el grid
     completo de categorías como fallback.
3. **Procesando** (era paso 3): animación premium "Analizando tu problema" (mantener,
   pasar cualquier emoji a lucide, ej. `Sparkles`/`Loader`).
4. **Resultados** (era paso 4): ver sección 5.

La `category` resuelta (por inferencia o por el chip) alimenta `TicketInput.category`
y `analyzeTicket` como hoy. En demo, `analyzeTicket` sigue devolviendo el mock por
categoría; el reorden no rompe nada.

---

## 4. Matching por especialización (reescribir scoring)

`src/lib/scoring.ts`:
```ts
export interface ScoreBreakdown {
  total: number
  specialist: boolean       // oficio principal == categoría del ticket
  sameZone: boolean
  rating: number | null
  jobs: number
}
export function scoreProfessional(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory?: string,
): number                    // se mantiene la firma actual (retorna number)
export function scoreBreakdown(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory: string,
): ScoreBreakdown            // nuevo, para mostrar el "por qué"
```
Ponderación (sobre la actual, agregando especialización):
- **Especialización** (nuevo): `categories[0] === ticketCategory` → **+35** (especialista);
  incluido pero no principal → **+15**; no incluido → penalización fuerte (`-100`) para
  que no se recomiende.
- **Geo**: misma zona → +25; si no, dentro del radio (`isInRadius`) → +12.
- **Rating**: `(avg_rating/5) * 20`.
- **Trabajos totales**: `min(jobs_count/100, 1) * 10`.
- **Disponible ahora**: +40. **Verificado**: +5. **Respuesta lenta (>30min)**: -5.
- `ticketCategory` opcional para no romper llamadas existentes; si no se pasa, el bloque
  de especialización se omite (comportamiento actual).

Nota demo: sin datos de "trabajos por categoría", la especialización se aproxima con la
categoría principal/secundaria. Cuando haya Supabase, se puede sustituir por conteo real
de trabajos/reseñas por categoría (fuera de este slice).

---

## 5. Resultados transparentes (premium)

En el paso de resultados, cada profesional recomendado se muestra con `ProfessionalCard`
(ya premium) + una fila de **chips "por qué"** derivados de `scoreBreakdown`:
- `Especialista en {label}` (ícono `getCategoryIcon`, si `specialist`).
- `Cerca tuyo` (`MapPin`, si `sameZone`).
- `★ {rating}` (`Star`).
- `{jobs} trabajos` (`Briefcase`).
Los chips usan el estilo chip premium (`#FAF6F0` / borde `#ECE4D8`).
- El primero de la lista se marca como **"Mejor opción para vos"** (badge naranja).
- Debajo de la lista: enlace secundario **"¿Preferís elegir vos?"** → `/buscar`.

---

## 6. Consistencia (emojis→lucide en TicketFlow)

Reemplazar en `TicketFlow.tsx` todos los emojis (✨, categorías, cualquier otro) por
íconos lucide, siguiendo el patrón del rollout (`getCategoryIcon` + `createElement`,
`Sparkles`, etc.). Mover `AUTOCOMPLETE_CATEGORIES` keywords a `inferCategory.ts`.

---

## Fuera de alcance (fases siguientes)

- Conversación IA real / preguntas dinámicas del LLM (necesita Supabase + key).
- Conteo real de trabajos por categoría para especialización (necesita datos Supabase).
- Estimación de precio, asistente de chat con IA.

---

## Constraints

- No agregar dependencias (lucide + framer-motion ya están).
- No cambiar la lógica de creación de solicitud ni `analyzeTicket` (solo el reorden y la
  categoría resuelta que se le pasa).
- Mantener el lenguaje visual premium en todas las pantallas del flujo.
- `scoreProfessional` mantiene su firma retornando `number` (param `ticketCategory`
  opcional) para no romper consumidores existentes.
- Correr `npm run lint` y `npm run build` antes del push.
