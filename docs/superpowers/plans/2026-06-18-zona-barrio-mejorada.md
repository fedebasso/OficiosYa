# Zona/barrio mejorada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el selector de 9 chips de zona por un bottom sheet con todos los barrios de Montevideo, persistir el barrio en la solicitud, y mostrarlo en el detalle.

**Architecture:** 4 tareas en orden: (1) crear lista de barrios, (2) reemplazar chips por bottom sheet en MediaStep + pasar zone en navigate, (3) recibir zone en TicketConfirm y persistirlo en `addRequest`, (4) mostrar barrio en SolicitudDetail.

**Tech Stack:** React 18 + TypeScript + Framer Motion + AnimatePresence.

## Global Constraints

- No agregar dependencias npm nuevas
- Archivos tocados: `src/lib/barrios.ts` (crear), `src/pages/TicketFlow.tsx`, `src/pages/TicketConfirm.tsx`, `src/pages/SolicitudDetail.tsx`
- El barrio es opcional — `zone: ''` si no seleccionó
- Bottom sheet: overlay oscuro + panel blanco desde abajo, lista scrolleable, cerrar al tocar fuera o al seleccionar
- Trigger sin selección: fondo `#FFFFFF`, borde `#EDE8DE`, texto `#555`
- Trigger con selección: fondo `rgba(232,104,58,.08)`, borde `#E8683A`, texto `#E8683A`
- Chip de barrio en SolicitudDetail: mismo estilo que chips de work_type (`background: '#F5F0E8', color: '#666'`)

---

### Task 1: Crear `src/lib/barrios.ts`

**Files:**
- Create: `oficioYa/src/lib/barrios.ts`

**Interfaces:**
- Consumes: nada
- Produces: `BARRIOS_MONTEVIDEO: string[]` — consumido por Task 2

- [ ] **Step 1: Crear `src/lib/barrios.ts`**

```ts
export const BARRIOS_MONTEVIDEO: string[] = [
  'Aguada', 'Aire Puro', 'Atahualpa', 'Bañados de Carrasco',
  'Barrio Sur', 'Belvedere', 'Brazo Oriental', 'Buceo',
  'Capurro', 'Carrasco', 'Carrasco Norte', 'Casabó',
  'Casavalle', 'Castro', 'Centro', 'Cerrito',
  'Cerro', 'Ciudad Vieja', 'Colón Centro', 'Colón Noroeste',
  'Conciliación', 'Cordón', 'Flor de Maroñas', 'Goes',
  'Ituzaingó', 'Jacinto Vera', 'La Blanqueada', 'La Comercial',
  'La Figurita', 'La Teja', 'La Unión', 'Larrañaga',
  'Las Acacias', 'Las Canteras', 'Lezica', 'Madureira',
  'Malvín', 'Malvín Norte', 'Manga', 'Maroñas',
  'Mercado Modelo', 'Millán', 'Montevideo Rural',
  'Nuevo París', 'Palermo', 'Parque Batlle', 'Parque Rodó',
  'Paso de la Arena', 'Paso de las Duranas', 'Peñarol',
  'Piedras Blancas', 'Pocitos', 'Prado', 'Punta Carretas',
  'Punta Gorda', 'Reducto', 'Rincón de Millán', 'Sayago',
  'Talar de Punta Gorda', 'Toledo Chico', 'Tres Cruces',
  'Tres Ombúes', 'Unión', 'Villa Española', 'Villa García',
  'Villa Muñoz', 'Villa del Cerro',
]
```

- [ ] **Step 2: Commit**

```bash
git add oficioYa/src/lib/barrios.ts
git commit -m "feat: lista completa de barrios de Montevideo"
```

---

### Task 2: Bottom sheet de barrios en `MediaStep` + pasar zone en navigate

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `BARRIOS_MONTEVIDEO` de Task 1
- Produces: `input.zone` pasado como `zone` en el state de navigate a `/ticket/confirmar`

- [ ] **Step 1: Agregar import de `BARRIOS_MONTEVIDEO`**

Al inicio del archivo, en los imports:
```ts
import { BARRIOS_MONTEVIDEO } from '../lib/barrios'
```

- [ ] **Step 2: Agregar estado `showZoneSheet` en `MediaStep`**

En el cuerpo de la función `MediaStep`, después de `const [showText, setShowText] = useState(false)`:
```ts
const [showZoneSheet, setShowZoneSheet] = useState(false)
```

- [ ] **Step 3: Reemplazar el bloque de chips de zona por el bottom sheet**

Encontrar y reemplazar el bloque completo:
```tsx
{/* Zona del cliente */}
<div className="flex flex-col gap-2">
  <div>
    <p className="text-sm font-bold" style={{ color: '#111111' }}>
      ¿En qué barrio necesitás el servicio?
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
      Opcional — te mostramos profesionales más cerca
    </p>
  </div>
  <div className="grid grid-cols-3 gap-2">
    {['Pocitos', 'Punta Carretas', 'Carrasco', 'Malvín', 'Buceo', 'Centro', 'Cordón', 'La Blanqueada', 'Parque Batlle'].map((zone) => {
      const active = input.zone === zone
      return (
        <motion.button
          key={zone}
          type="button"
          onClick={() => onChange({ zone: active ? '' : zone })}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl py-2 px-1 text-center text-[11px] font-bold leading-tight"
          style={{
            background: active ? '#E8683A' : '#FFFFFF',
            border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
            color: active ? '#FFFFFF' : '#555555',
          }}
        >
          {zone}
        </motion.button>
      )
    })}
  </div>
</div>
```

Por:

```tsx
{/* Zona del cliente — trigger */}
<div>
  <motion.button
    type="button"
    onClick={() => setShowZoneSheet(true)}
    whileTap={{ scale: 0.98 }}
    className="w-full flex items-center justify-between rounded-xl py-3 px-4"
    style={{
      background: input.zone ? 'rgba(232,104,58,.08)' : '#FFFFFF',
      border: `1.5px solid ${input.zone ? '#E8683A' : '#EDE8DE'}`,
    }}
  >
    <span className="text-sm font-bold" style={{ color: input.zone ? '#E8683A' : '#555555' }}>
      📍 {input.zone || 'Seleccioná tu barrio'}
    </span>
    {input.zone ? (
      <span
        onClick={(e) => { e.stopPropagation(); onChange({ zone: '' }) }}
        className="text-xs font-black px-1.5 py-0.5 rounded-full"
        style={{ color: '#E8683A', background: 'rgba(232,104,58,.15)' }}
      >
        ×
      </span>
    ) : (
      <span className="text-xs" style={{ color: '#CCC' }}>▼</span>
    )}
  </motion.button>
  <p className="text-xs mt-1 px-1" style={{ color: '#AAAAAA' }}>
    Opcional — te mostramos profesionales más cerca
  </p>
</div>

{/* Bottom sheet de barrios */}
<AnimatePresence>
  {showZoneSheet && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.5)' }}
        onClick={() => setShowZoneSheet(false)}
      />
      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
        style={{ background: '#FFFFFF', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid #F0EBE1' }}>
          <p className="text-base font-black" style={{ color: '#111111' }}>¿En qué barrio?</p>
          <button
            type="button"
            onClick={() => setShowZoneSheet(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#F5F0E8' }}
          >
            <span className="text-sm font-black" style={{ color: '#555' }}>×</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {BARRIOS_MONTEVIDEO.map((barrio) => {
            const selected = input.zone === barrio
            return (
              <button
                key={barrio}
                type="button"
                onClick={() => { onChange({ zone: barrio }); setShowZoneSheet(false) }}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid #F5F0E8',
                  background: selected ? 'rgba(232,104,58,.06)' : 'transparent',
                  color: selected ? '#E8683A' : '#333333',
                  fontWeight: selected ? 700 : 400,
                }}
              >
                <span className="text-sm">{barrio}</span>
                {selected && <span style={{ color: '#E8683A', fontSize: 16 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Nota:** `AnimatePresence` ya está importado en el archivo. Verificar que esté en los imports al inicio — si no, agregar desde `'framer-motion'`.

- [ ] **Step 4: Agregar `zone: input.zone` al state en `handlePedir`**

Reemplazar:
```ts
const handlePedir = (pro: ProfessionalWithProfile, resolvedTicket?: GeneratedTicket) => {
  const t = resolvedTicket ?? ticket
  navigate('/ticket/confirmar', {
    state: { ticket: t, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating },
  })
}
```

Por:
```ts
const handlePedir = (pro: ProfessionalWithProfile, resolvedTicket?: GeneratedTicket) => {
  const t = resolvedTicket ?? ticket
  navigate('/ticket/confirmar', {
    state: { ticket: t, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating, zone: input.zone },
  })
}
```

- [ ] **Step 5: Verificar en dev server (http://localhost:5177)**

Navegar a `/ticket`, ir al paso 2. Confirmar:
- Aparece el botón trigger "📍 Seleccioná tu barrio"
- Al tocarlo se abre el bottom sheet con lista scrolleable de todos los barrios
- Al seleccionar un barrio se cierra el sheet y el trigger muestra `📍 Pocitos`
- El `×` deselecciona
- Tocar fuera del sheet lo cierra

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: bottom sheet de barrios en MediaStep y zone en navigate"
```

---

### Task 3: `TicketConfirm` recibe zone y lo persiste en la solicitud

**Files:**
- Modify: `oficioYa/src/pages/TicketConfirm.tsx`

**Interfaces:**
- Consumes: `state.zone: string` pasado desde Task 2
- Produces: `addRequest({ ..., location: zone })` — consumido por Task 4 (zona en SolicitudDetail)

- [ ] **Step 1: Agregar `zone` a `LocationState`**

Encontrar la interfaz `LocationState` y agregar `zone`:

```ts
interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
  zone: string
}
```

- [ ] **Step 2: Leer `zone` del state en el componente**

Encontrar:
```ts
const { ticket, proId, proName, proAvatar, proRating } = state
```

Cambiar a:
```ts
const { ticket, proId, proName, proAvatar, proRating, zone } = state
```

- [ ] **Step 3: Pasar `location` en `addRequest`**

Encontrar el `await addRequest({...})` en `handleSubmit` y agregar `location`:

```ts
await addRequest({
  professional_id: proId,
  category: ticket.category,
  description: ticket.description,
  urgency: ticket.urgent,
  contact_phone: phone,
  work_type: ticket.work_type,
  location: zone || undefined,
})
```

- [ ] **Step 4: Verificar en dev server**

Completar el flujo completo: ticket → seleccionar barrio → analizar → confirmar. Abrir devtools → Application → Zustand store (o React DevTools) y verificar que la solicitud creada tiene `location: 'Pocitos'` (o el barrio seleccionado).

- [ ] **Step 5: Commit**

```bash
git add oficioYa/src/pages/TicketConfirm.tsx
git commit -m "feat: persistir barrio del cliente en ServiceRequest.location"
```

---

### Task 4: Mostrar barrio en `SolicitudDetail`

**Files:**
- Modify: `oficioYa/src/pages/SolicitudDetail.tsx`

**Interfaces:**
- Consumes: `req.location: string | undefined` de `ServiceRequest`
- Produces: chip de barrio visible en la tarjeta de descripción

- [ ] **Step 1: Agregar chip de barrio en la tarjeta de descripción**

En `SolicitudDetail.tsx`, dentro del bloque de chips que está después de `{req.description}`, agregar el chip de barrio junto a los de `work_type` y urgencia:

Encontrar:
```tsx
<div className="flex gap-2 flex-wrap mt-1">
  {req.work_type && (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: '#F5F0E8', color: '#666' }}>
      📋 {WORK_TYPE_LABELS[req.work_type] ?? req.work_type}
    </span>
  )}
  {req.urgency && (
```

Agregar después del chip de `work_type` y antes del de urgencia:

```tsx
{req.location && (
  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
    style={{ background: '#F5F0E8', color: '#666' }}>
    📍 {req.location}
  </span>
)}
```

El resultado del bloque completo:
```tsx
<div className="flex gap-2 flex-wrap mt-1">
  {req.work_type && (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: '#F5F0E8', color: '#666' }}>
      📋 {WORK_TYPE_LABELS[req.work_type] ?? req.work_type}
    </span>
  )}
  {req.location && (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: '#F5F0E8', color: '#666' }}>
      📍 {req.location}
    </span>
  )}
  {req.urgency && (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
      🚨 Urgente
    </span>
  )}
  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
    style={{ background: '#F5F0E8', color: '#888' }}>
    🕐 {time}
  </span>
</div>
```

- [ ] **Step 2: Verificar en dev server**

Navegar a `/mis-solicitudes`, abrir una solicitud. Si tiene barrio (`location`), debe aparecer el chip `📍 Pocitos`. Si no tiene barrio, no aparece nada (comportamiento correcto — campo opcional).

Para probar con barrio: completar el flujo completo seleccionando un barrio antes del análisis.

- [ ] **Step 3: Commit**

```bash
git add oficioYa/src/pages/SolicitudDetail.tsx
git commit -m "feat: mostrar barrio del cliente en SolicitudDetail"
```
