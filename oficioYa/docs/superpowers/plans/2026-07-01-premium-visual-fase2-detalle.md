# Premium Visual — Fase 2 (Detalle del profesional) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar el look premium (íconos lucide, stats destacados, sombras cálidas) a la pantalla de detalle del profesional, manteniendo la base crema.

**Architecture:** Todos los cambios en `src/components/professionals/ProfessionalProfile.tsx`. Reutiliza `getCategoryIcon` (Fase 1) y renderiza íconos dinámicos con `createElement`. Se divide en 3 tareas de edición por sección + verificación.

**Tech Stack:** React + TypeScript + lucide-react (ya instalado) + framer-motion

## Global Constraints

- No agregar dependencias — `lucide-react` ya instalado
- Base crema se mantiene; no cambiar ancho ni layout general
- Sombra premium card: `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`
- Borde card premium: `1px solid #ECE6DC`, `border-radius: 20`
- Renderizar íconos dinámicos con `createElement` (regla `react-hooks/static-components`)
- No romper `CATEGORY_EMOJI`; no tocar `ReviewsSection`
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: Imports + Hero (stats destacados + chips secundarios)

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

**Interfaces:**
- Consumes: `getCategoryIcon` de `../../lib/categories` (Fase 1)

- [ ] **Step 1: Actualizar imports**

En `src/components/professionals/ProfessionalProfile.tsx`:

Cambiar el import de React (línea 1):
```tsx
import { useEffect, useState } from 'react'
```
por:
```tsx
import { createElement, useEffect, useState } from 'react'
```

Cambiar el import de lucide (actualmente `import { ChevronLeft, Share2, Check } from 'lucide-react'`) por:
```tsx
import { ChevronLeft, Share2, Check, Star, MapPin, Clock, BadgeCheck } from 'lucide-react'
```

Cambiar el import de categorías (actualmente `import { getCategoryMeta, CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'`) por:
```tsx
import { getCategoryMeta, getCategoryIcon, CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'
```

- [ ] **Step 2: Refinar el ring del avatar**

Reemplazar:
```tsx
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 flex-shrink-0"
          style={{ border: '3px solid #E8683A', boxShadow: '0 0 0 6px rgba(232,104,58,.08)' }}
        >
```
por:
```tsx
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 flex-shrink-0"
          style={{ border: '3px solid #EFA07A', boxShadow: '0 0 0 5px rgba(232,104,58,.08)' }}
        >
```

- [ ] **Step 3: Reemplazar el bloque de indicadores de confianza**

Reemplazar el bloque completo:
```tsx
        {/* Indicadores de confianza */}
        <motion.div variants={scaleIn} className="flex items-center gap-4 flex-wrap justify-center">
          {avg_rating != null && (
            <div className="flex items-center gap-1">
              <span style={{ color: '#F59E0B', fontSize: 18 }}>★</span>
              <span className="font-black text-base" style={{ color: '#111111' }}>{avg_rating}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>🔨</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{jobs_count} trabajos</span>
          </div>
          {verified && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: '#F0FDF4', color: '#0F6E56', border: '1px solid #86EFAC' }}
            >
              ✓ Profesional Verificado
            </span>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{zone}</span>
          </div>
          {estimatedDuration !== null && (
            <div className="flex items-center gap-1">
              <span>⏱</span>
              <span className="font-semibold text-sm" style={{ color: '#555555' }}>Duración estimada: {formatDuration(estimatedDuration)}</span>
            </div>
          )}
        </motion.div>
```
por:
```tsx
        {/* Stats destacados */}
        <motion.div variants={scaleIn} className="w-full" style={{ maxWidth: 320 }}>
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              border: '1px solid #ECE6DC',
              borderRadius: 16,
              boxShadow: '0 2px 6px rgba(60,40,20,.05)',
              overflow: 'hidden',
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={18} fill="#F5A623" color="#F5A623" />
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>
                  {avg_rating != null ? avg_rating.toFixed(1) : '—'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Calificación</div>
            </div>
            <div style={{ width: 1, background: '#F0EAE0' }} />
            <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>{jobs_count}</div>
              <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Trabajos</div>
            </div>
          </div>

          {/* Chips secundarios */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {verified && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#15803D', fontSize:12, fontWeight:700 }}>
                <BadgeCheck size={14} /> Verificado
              </span>
            )}
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#FAF6F0', color:'#7A6E5E', fontSize:12, fontWeight:700 }}>
              <MapPin size={14} style={{ color:'#B3A794' }} /> {zone}
            </span>
            {estimatedDuration !== null && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#FAF6F0', color:'#7A6E5E', fontSize:12, fontWeight:700 }}>
                <Clock size={14} style={{ color:'#B3A794' }} /> {formatDuration(estimatedDuration)}
              </span>
            )}
          </div>
        </motion.div>
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Expected: sin errores (sin variable sin usar; `CATEGORY_EMOJI` sigue usándose en Servicios por ahora).

- [ ] **Step 5: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: premium hero with stats block and lucide chips in professional detail"
```

---

### Task 2: Card "Servicios" con íconos lucide

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

**Interfaces:**
- Consumes: `getCategoryIcon`, `createElement` (importados en Task 1)

- [ ] **Step 1: Reemplazar los chips de servicios**

Reemplazar:
```tsx
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}
              >
                {CATEGORY_EMOJI[c] ?? '🛠️'} {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
          </div>
```
por:
```tsx
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ background: '#FAF6F0', color: '#7A6E5E', border: '1px solid #ECE4D8' }}
              >
                {createElement(getCategoryIcon(c), { size: 14, style: { color: '#D4571F' } })}
                {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
          </div>
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Expected: sin errores. Nota: `CATEGORY_EMOJI` ya no se usa en este archivo tras este cambio — si TypeScript/ESLint marca el import como no usado, quitar `CATEGORY_EMOJI` del import de categorías (dejando `getCategoryMeta, getCategoryIcon, CATEGORY_LABELS`).

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: lucide icons in services chips of professional detail"
```

---

### Task 3: Cards del body premium + CTA

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

- [ ] **Step 1: Unificar el estilo de las 4 cards del body**

Hay cuatro cards con el mismo estilo actual. Reemplazar **todas** las ocurrencias de:
```tsx
style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
```
por:
```tsx
style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}
```

(Aplica a las cards "Sobre mí", "Servicios", "Trabajos realizados" y "Disponibilidad". Cada una tiene `className="... rounded-2xl p-4"` — el `borderRadius: 20` inline coexiste con `rounded-2xl`; es intencional para asegurar el radio premium.)

- [ ] **Step 2: Refinar los encabezados internos de sección**

Reemplazar **todas** las ocurrencias de la clase de header de sección:
```tsx
className="text-xs font-bold text-[#555] uppercase tracking-widest mb-2"
```
por:
```tsx
className="text-xs font-bold uppercase tracking-widest mb-2"
style={{ color: '#8A7F6E' }}
```
y las que usan `mb-3`:
```tsx
className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3"
```
por:
```tsx
className="text-xs font-bold uppercase tracking-widest mb-3"
style={{ color: '#8A7F6E' }}
```

- [ ] **Step 3: Refinar el botón CTA**

Reemplazar:
```tsx
          className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 text-white"
          style={{ background: '#e8683a', boxShadow: '0 4px 16px rgba(232,104,58,.3)' }}
```
por:
```tsx
          className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 text-white"
          style={{ background: '#e8683a', borderRadius: 16, boxShadow: '0 6px 20px -6px rgba(232,104,58,.45)' }}
```

- [ ] **Step 4: Verificar TypeScript y browser**

```bash
npx tsc --noEmit
```
Expected: sin errores.

Abrir `http://localhost:5173/profesional/1` (o cualquier id de profesional). Verificar: stats destacados, chips con íconos, cards con sombra premium, CTA refinado.

- [ ] **Step 5: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: premium card shadows, section headers and CTA in professional detail"
```

---

### Task 4: Lint, build, deploy

- [ ] **Step 1: Lint**

```bash
npm run lint
```
Expected: sin errores. (Si marca `CATEGORY_EMOJI` sin usar, quitarlo del import de categorías y volver a correr.)

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: `✓ built in X.XXs` sin errores.

- [ ] **Step 3: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`
