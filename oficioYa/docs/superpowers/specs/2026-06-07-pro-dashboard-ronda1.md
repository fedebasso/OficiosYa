# Pro Dashboard Ronda 1 — ProOnboarding + ProProfile

**Date:** 2026-06-07
**Status:** Approved by user

---

## 1. ProOnboarding (`src/pages/pro/ProOnboarding.tsx`) — Opción B

### Hero
- `background: linear-gradient(160deg,#0F6E56,#07453a)` + wave `absolute bottom-0 h-8 bg-background rounded-t-[32px]`
- Label "PORTAL PROFESIONAL" — text-[9px] font-bold uppercase tracking-widest text-white/50
- Logo "Oficio**Ya**" — text-2xl font-black text-white + Ya en text-accent
- Greeting: "¡Hola, {firstName}! 👋" — text-lg font-black text-white (firstName = primer nombre de user.full_name)
- Subtitle: "Completá tu perfil para empezar a recibir clientes" — text-xs text-white/60

### Body
- Título sección: "Progreso del perfil — 0 de 3" — text-[10px] font-bold text-gray-400 uppercase tracking-wide
- Barra de progreso: `bg-gray-200 rounded-full h-1.5` con fill `bg-primary` al 0% (siempre 0 en esta versión)
- 3 cards de steps (`bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3`):
  - `📝` Bio y experiencia — "Contá quién sos y qué hacés" — badge "Pendiente" (bg-amber-50 text-amber-700 border border-amber-200)
  - `🔧` Servicios y zona — "Qué ofrecés y dónde trabajás" — badge "Pendiente"
  - `📱` WhatsApp de contacto — "Para que los clientes te escriban" — badge "Pendiente"
- Botón primario: "Completar mi perfil →" — bg-primary rounded-2xl py-3.5 font-bold shadow verde → navigate('/pro/perfil')
- Link ghost: "Ver solicitudes" — text-primary font-bold text-sm text-center → navigate('/pro/solicitudes')

---

## 2. ProProfile (`src/pages/pro/ProProfile.tsx`) — Opción B

### Hero gradient oscuro
- `background: linear-gradient(150deg, #064e3b, #0F6E56 50%, #047857)`
- pt-10 pb-16 position:relative
- Botón "← Volver" — text-white/70 text-sm → navigate(-1)
- Wave: `absolute bottom-0 h-8 bg-background rounded-t-[32px]`
- Avatar centrado:
  - `w-18 h-18` (72px) rounded-full, border-3 border-white/40, `box-shadow: 0 0 0 6px rgba(255,255,255,.1)` outer glow
  - Iniciales usando Avatar component `size="lg"` con wrapper `w-[72px] h-[72px]`
  - Botón cámara: `absolute bottom-0 right-0`, bg-white, rounded-full, w-6 h-6, Camera icon (lucide)
- Nombre: text-base font-black text-white
- Especialidad: primera categoría seleccionada → CATEGORY_LABELS map, text-xs text-white/65

### Card flotante (bg-white rounded-2xl shadow-xl mx-4 mt-[-28px] p-4)
- **Stats row**: flex justify-around con dividers verticales (w-px bg-gray-100)
  - Rating: valor avg_rating del mock o "4.8" de display / label "Rating"
  - Trabajos: jobs_count / label "Trabajos"
  - Respuesta: "~15m" si available_now / label "Respuesta"
  - Cada stat: valor `text-base font-black text-text-main` + label `text-[8px] text-gray-400 uppercase tracking-wide`
- Separador `border-t border-gray-100 my-3`
- **Toggle disponibilidad** (grid 2 cols, gap-2):
  - Activo: `bg-primary text-white rounded-xl py-2 text-[11px] font-bold`
  - Inactivo: `bg-gray-50 text-gray-400 border border-gray-200 rounded-xl py-2 text-[11px] font-bold`
  - Opción 1: "⚡ Urgencias 24H" (mapea a `available_now: true`)
  - Opción 2: "Solo diurno" (mapea a `available_now: false`)
  - Estado manejado con `useState<boolean>` local `availableNow`

### Campos (padding:12px, flex-col gap-3)
Cada campo es una card `bg-white rounded-2xl shadow-sm p-4`:
- Label: `text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2`
- **Bio**: textarea, `border-[1.5px] border-gray-100 rounded-xl p-3 text-sm bg-gray-50 resize-none h-24 focus:border-primary focus:ring-2 focus:ring-primary/10`
- **WhatsApp**: input tel con ícono 📱, mismo estilo que Login
- **Servicios** (5 categorías en grid 3 cols + overflow con fila 2):
  ```
  CATEGORIES = [
    { id: 'electricista', label: 'Electricista', emoji: '⚡' },
    { id: 'plomero', label: 'Sanitario', emoji: '🚿' },
    { id: 'aire_acondicionado', label: 'Aire Ac.', emoji: '❄️' },
    { id: 'cerrajero', label: 'Cerrajero', emoji: '🔑' },
    { id: 'albanil', label: 'Albañil', emoji: '🧱' },
  ]
  ```
  Grid 3 cols + extra cat en fila 2:
  - Seleccionado: `bg-gradient-to-br from-green-50 to-emerald-50 border-[1.5px] border-primary rounded-xl p-2.5 text-center`
  - No seleccionado: `bg-gray-50 border-[1.5px] border-gray-100 rounded-xl p-2.5 text-center`
  - Emoji (text-lg) + label (text-[9px] font-bold, text-primary si sel, text-gray-400 si no)
- **Zona** (select nativo con apariencia custom o select estilizado):
  - Wrapper `border-[1.5px] border-gray-100 rounded-xl bg-gray-50 px-3 py-3 flex items-center justify-between`
  - Texto actual de zona + "▼" en text-gray-400
  - ZONES: misma lista que la actual (Pocitos, Malvín, Centro, Carrasco, Punta Carretas, Cordón, Tres Cruces, La Blanqueada, Buceo, Parque Batlle)

### Botón guardar
- `background: linear-gradient(135deg,#0F6E56,#047857)` + rounded-2xl py-4 font-black text-base
- `box-shadow: 0 6px 16px rgba(15,110,86,.35)`
- Texto: "✓ Guardado" si saved (2 seg), "Guardar cambios" normal
- Margin: mx-4 mb-6

### Estado local
```ts
const [bio, setBio] = useState('')
const [whatsapp, setWhatsapp] = useState(user?.phone ?? '')
const [zone, setZone] = useState('')
const [selectedCategories, setSelectedCategories] = useState<string[]>([])
const [availableNow, setAvailableNow] = useState(false)
const [saved, setSaved] = useState(false)
```

### Navegación
- Agregar `useNavigate` para botón volver

---

## Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/pages/pro/ProOnboarding.tsx` | Rediseño completo — opción B |
| `src/pages/pro/ProProfile.tsx` | Rediseño completo — opción B |

## Out of scope
- Guardar en Supabase (solo simula el guardado)
- Subir foto de avatar/portada
- Mostrar stats reales en ProProfile (son decorativos en mock mode)
