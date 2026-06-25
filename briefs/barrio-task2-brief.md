# Barrio Task 2: Bottom sheet en MediaStep + zone en navigate

**Working dir:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto
- `BARRIOS_MONTEVIDEO: string[]` ya existe en `src/lib/barrios.ts` (Task 1)
- En `src/pages/TicketFlow.tsx`, la función `MediaStep` actualmente tiene un grid de 9 chips de zona (líneas ~274-305). Hay que reemplazarlo por un bottom sheet.
- `AnimatePresence` ya está importado desde `'framer-motion'` en el archivo.

## Cambios en `src/pages/TicketFlow.tsx`

### Step 1: Agregar import de `BARRIOS_MONTEVIDEO`
```ts
import { BARRIOS_MONTEVIDEO } from '../lib/barrios'
```

### Step 2: Agregar estado `showZoneSheet` en `MediaStep`
Después de `const [showText, setShowText] = useState(false)`:
```ts
const [showZoneSheet, setShowZoneSheet] = useState(false)
```

### Step 3: Reemplazar el bloque completo de chips de zona por el bottom sheet

El bloque a reemplazar empieza en `{/* Zona del cliente */}` y termina antes del botón "Analizar con IA". Reemplazarlo por:

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

### Step 4: Agregar `zone: input.zone` en `handlePedir`

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

### Step 5: Commit
```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: bottom sheet de barrios en MediaStep y zone en navigate"
```

## Constraints
- Solo modificar `src/pages/TicketFlow.tsx`
- `AnimatePresence` ya está importado — no agregar import duplicado
- La zona NO afecta `hasContent`

## Reporte
Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\barrio-task2-report.md`.
Devolver: STATUS, commit hash, una línea.
