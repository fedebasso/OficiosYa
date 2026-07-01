# Upgrade Visual Premium — Fase 1 (Home + Card de profesional)

## Objetivo

Elevar la percepción visual de la app a un look premium/minimalista, manteniendo la
base cálida (crema `#F5F0E8` + naranja) e identidad OFIX. Esta fase cubre las
superficies de mayor visibilidad: la **card de profesional** (aparece en búsqueda,
favoritos, home y "Mejor calificados") y la **Home**.

Dirección validada con mockups en el visual companion (usuario aprobó ambos).

---

## Principios de la fase

- **Base crema se mantiene** — no migramos a blanco en esta fase.
- **Emojis de UI → íconos lucide monocromáticos** (`lucide-react` ya instalado).
  Los emojis de categorías (⚡🚿❄️🔑🎨🧱) se reemplazan por íconos lucide.
- **Sombras más suaves y profundas** — de sombras planas a sombras con tinte cálido
  y profundidad (`0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`).
- **Mejor jerarquía** — nombre más prominente, info secundaria separada, más respiración.
- **Sin cambios de ancho ni layout** — todo dentro del contenedor de 480px existente.

---

## 1. Mapa de íconos por categoría (nuevo)

Crear en `src/lib/categories.ts` un mapa `CATEGORY_ICON` que asocia cada categoría a
un componente de ícono de `lucide-react`:

| Categoría | Ícono lucide |
|---|---|
| electricista | `Zap` |
| plomero | `Droplets` |
| aire_acondicionado | `Snowflake` |
| cerrajero | `KeyRound` |
| pintor | `Paintbrush` |
| albanil | `Hammer` |
| carpintero | `Hammer` |
| jardinero | `Sprout` |
| herrero | `Wrench` |
| limpieza | `Sparkles` |
| mudanzas | `Package` |
| manitas | `Wrench` |
| otros | `Wrench` |

Se expone un helper `getCategoryIcon(cat: string)` que devuelve el componente
(fallback `Wrench`). Los emojis existentes (`CATEGORY_EMOJI`) se mantienen para no
romper otros consumidores todavía no migrados; esta fase migra solo Home y card.

---

## 2. ProfessionalCard (rediseño)

**Archivo:** `src/components/professionals/ProfessionalCard.tsx`

Cambios respecto al actual:

- **Contenedor:** `border-radius: 20px`, borde `1px solid #ECE6DC`, sombra premium
  (`0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`), padding 16px.
- **Layout en dos filas** separadas por un divisor sutil (`#F0EAE0`):
  - Fila superior: avatar + (nombre, chip categoría) + corazón favorito a la derecha.
  - Fila inferior: zona (ícono `MapPin`) + trabajos · rating en pastilla.
- **Avatar:** 58px, `border-radius: 18px`, gradiente cálido, ring interno sutil,
  **badge de verificado** (círculo verde `#22A559` con check lucide) abajo-derecha si
  `verified === true`.
- **Chip de categoría:** ícono lucide (`getCategoryIcon`) en naranja `#D4571F` + label
  monocromático `#7A6E5E` — reemplaza el chip naranja con emoji.
- **Corazón favorito:** ícono lucide `Heart` (relleno cuando es favorito), fondo
  `#FAF6F0`, sin borde.
- **Rating:** pastilla `#FFF7ED` con estrella lucide rellena `#F5A623` + valor +
  `(count)`. Mantiene el fallback "Sin reseñas" cuando `avg_rating == null`.

Se conservan intactos: navegación al perfil, toggle de favorito, y accesibilidad
(la card sigue siendo `role="button"` con teclado).

---

## 3. Home (rediseño)

**Archivos:** `src/pages/Home.tsx`, `src/components/home/CategoryIcons.tsx`

### 3.1 Buscador (header)
- Reemplazar el emoji `🔍` por el ícono lucide `Search` (`#C2B8A6`).
- Fondo del input `#F6F1EA`, borde `1.5px solid #ECE4D8`, `border-radius: 15px`,
  altura 48px. Placeholder "¿Qué servicio necesitás?" en `#B0A594`.

### 3.2 Fila de categorías (se agrega a la Home)
- `CategoryIcons` hoy existe pero **no se renderiza** en Home. Se migra a íconos
  lucide monocromáticos y se **inserta en Home** justo debajo del header, antes de
  `HowItWorks`.
- Cada tile: 58px, `border-radius: 19px`, fondo blanco, borde `#ECE4D8`, sombra
  suave, ícono lucide `getCategoryIcon` (`#4A4034`, size 24). Label debajo en
  `#6B6152`. Fila horizontal scrolleable.

### 3.3 Encabezados de sección
- Estandarizar el encabezado de "Mejor calificados" (`TopRated`) y de
  "Profesionales destacados" (`FeaturedProfessionals`): título 18px `font-weight:800`
  `color:#1A1712` `letter-spacing:-.4px`, con enlace opcional "Ver todos" a la derecha
  en `#D4571F`. (En esta fase se aplica al menos a `TopRated`; `FeaturedProfessionals`
  se alinea si el encabezado ya existe.)

---

## 4. Fuera de alcance (fases siguientes)

- Migración a base blanca/neutra.
- Rediseño de Login, Registro, Perfil, Chat, flujos de solicitud, dashboards de
  profesional.
- Reemplazo de emojis en pantallas no incluidas en esta fase.

---

## Constraints

- No agregar dependencias — `lucide-react` ya está instalado.
- No cambiar el ancho del contenedor (480px) ni el layout general.
- No romper consumidores existentes de `CATEGORY_EMOJI` (se mantiene el mapa).
- Mantener accesibilidad ya agregada (aria-labels en ratings/botones).
- Correr `npm run lint` y `npm run build` antes de cada push (regla del proyecto).
