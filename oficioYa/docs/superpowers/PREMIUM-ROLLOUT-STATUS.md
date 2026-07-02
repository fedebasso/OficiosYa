# OFIX — Estado del rollout visual premium (para retomar)

> Documento de continuidad. Si la sesión se corta, leer esto primero para saber
> qué está hecho, cuál es el lenguaje visual, y qué falta.

Última actualización: 2026-07-01

---

## Contexto del proyecto

- App: **OFIX** — PWA mobile-first de servicios del hogar en Montevideo.
- Stack: React 19 + Vite + TypeScript + Tailwind + framer-motion + zustand + Supabase.
- Ubicación: `C:\Users\fede8\Documents\OficiosYa\oficioYa`
- Deploy: Vercel, producción en `https://oficios-ya-8112.vercel.app` (comando `vercel --prod`).
- Repo: `https://github.com/fedebasso/OficiosYa` (rama `main`).
- **Modo demo activo** (`IS_DEMO_MODE`): toda la data es mock. Supabase no conectado aún.
- Regla del proyecto: **correr `npm run lint` y `npm run build` antes de cada push**.

---

## Lenguaje visual premium (YA APROBADO — aplicar igual en todas las fases)

- **Base crema se mantiene:** fondo `#F5F0E8`, cards `#FFFFFF`.
- **Emojis de UI → íconos lucide monocromáticos** (`lucide-react` ya instalado).
- **Íconos de categoría:** usar `getCategoryIcon(cat)` de `src/lib/categories.ts`
  (devuelve un `LucideIcon`). **Renderizar con `createElement(Icon, { size, style })`**
  para evitar el error de lint `react-hooks/static-components`.
- **Sombra premium de card:** `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`
- **Borde card:** `1px solid #ECE6DC`, `border-radius: 20`.
- **Colores de texto:** principal `#1A1712`; secundario `#7A6E5E` / `#8A7F6E`; terciario `#B3A794` / `#9C917E`.
- **Naranja acento (íconos/CTA):** `#D4571F` / `#E8683A`. **Verde verificado:** `#22A559` / `#15803D`.
- **Chips:** fondo `#FAF6F0`, borde `#ECE4D8`, texto `#7A6E5E`, ícono lucide en `#D4571F`.
- **Estrella rating:** `Star` de lucide, `fill="#F5A623" color="#F5A623"`.
- **Encabezado de sección:** 18px `font-weight:800` `color:#1A1712` `letter-spacing:-.4px`, con "Ver todos" opcional en `#D4571F`.
- **NO cambiar** el ancho del contenedor (480px) ni el layout general.
- **NO romper** `CATEGORY_EMOJI` (aún lo usan pantallas no migradas).

Specs de referencia con el detalle:
- `docs/superpowers/specs/2026-07-01-premium-visual-fase1-design.md`
- `docs/superpowers/specs/2026-07-01-premium-visual-fase2-detalle-design.md`

---

## HECHO ✅

### Fase 1 — Home + Card de profesional
- `src/lib/categories.ts`: agregado `CATEGORY_ICON` + `getCategoryIcon()`.
- `src/components/professionals/ProfessionalCard.tsx`: rediseño premium (avatar con
  badge verificado, chip lucide, rating en pastilla, sombra premium, 2 filas + divisor).
- `src/pages/Home.tsx`: buscador con ícono `Search`, fila de categorías insertada.
- `src/components/home/TopRated.tsx`: encabezado refinado + "Ver todos", sin emoji de zona.

### Fase 2 — Detalle del profesional
- `src/components/professionals/ProfessionalProfile.tsx`: hero con bloque de stats
  destacado (rating + trabajos), chips secundarios lucide (verificado/zona/duración),
  chips de servicios con lucide, cards del body con sombra premium, CTA refinado.

### Fix Home emojis (post-Fase 2)
- `src/components/home/CategoryIcons.tsx`: pasado a lucide (en Fase 1 el subagente
  reportó el cambio pero NO se había aplicado; corregido).
- `src/components/home/FeaturedProfessionals.tsx`: filtros de categoría con lucide.

---

## PENDIENTE (fases siguientes) 🔜

Orden acordado con el usuario:

- **Fase 3 — Cliente alto tráfico:** `src/pages/Search.tsx` (header, chips de filtro,
  estado vacío, historial) + `src/pages/Favoritos.tsx`.  ← EN CURSO
- **Fase 4 — Solicitudes:** `src/pages/MisSolicitudes.tsx` + `src/pages/SolicitudDetail.tsx`
  + `src/pages/Urgencias.tsx`.
- **Fase 5 — Comunicación:** `src/pages/Mensajes.tsx` + `src/pages/Chat.tsx`.
- **Fase 6 — Profesional:** `ProDashboard`, `ProRequests`, `ProProfile`, `ProAvailability`,
  `ProWorkHistory` (en `src/pages/pro/`).
- **Fase 7 — Cuenta:** `src/pages/ClientProfile.tsx` + `Login`/`Register`.

Método por fase: brainstorm/design corto → spec → plan → ejecutar → lint+build → deploy.
Buscar emojis restantes con: grep de `⚡|🚿|❄️|🔑|🎨|🧱|📍|⏱|🔨|🔍|🛠` y `CATEGORY_EMOJI`.

---

## Otro pendiente conocido (no visual)

- **Bug latente reviewService** (para cuando se active Supabase): ver
  `docs/superpowers/notes/2026-07-01-reviewService-id-mismatch.md`.
- Editar perfil cliente (subir foto/datos): spec en
  `docs/superpowers/specs/2026-06-29-client-profile-edit-design.md` (aprobado, sin implementar).
