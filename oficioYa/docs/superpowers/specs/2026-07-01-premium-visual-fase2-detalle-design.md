# Upgrade Visual Premium — Fase 2 (Detalle del profesional)

## Objetivo

Aplicar el lenguaje premium ya validado en Fase 1 (íconos lucide monocromáticos,
base crema, sombras cálidas, mejor jerarquía) a la pantalla de **detalle del
profesional** (`/profesional/:id`), la superficie de conversión donde el cliente
decide contratar.

**Archivo principal:** `src/components/professionals/ProfessionalProfile.tsx`

Continuación de `2026-07-01-premium-visual-fase1-design.md`. Reutiliza
`getCategoryIcon` (ya creado en Fase 1) y los tokens de sombra/borde establecidos.

---

## Tokens reutilizados (de Fase 1)

- Sombra premium: `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`
- Borde card: `1px solid #ECE6DC`, `border-radius: 20px`
- Naranja de acento para íconos: `#D4571F`
- Texto principal: `#1A1712`; secundario: `#8A7F6E` / `#7A6E5E`; terciario: `#B3A794`
- Verde verificado: `#22A559`

---

## 1. Hero — bloque de stats destacado (Opción B aprobada)

Reemplaza la fila actual de indicadores con emojis (★ 🔨 ✓ 📍 ⏱).

### Avatar
- Se mantiene el avatar redondo de 96px, pero el ring se refina:
  `border: 3px solid #E8683A` → `border: 3px solid #EFA07A` con
  `box-shadow: 0 0 0 5px rgba(232,104,58,.08)` (ring más suave).

### Nombre y especialidad
- Sin cambios de estructura: `h1` nombre + `p` con `{specialty} · {zone}`.

### Bloque de stats (nuevo)
Tarjeta blanca centrada bajo el nombre, con dos columnas separadas por un divisor
vertical:

```tsx
<div style={{
  display: 'flex', background: '#FFFFFF', border: '1px solid #ECE6DC',
  borderRadius: 16, boxShadow: '0 2px 6px rgba(60,40,20,.05)',
  overflow: 'hidden', marginTop: 16, marginBottom: 14,
}}>
  {/* Rating */}
  <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Star size={18} fill="#F5A623" color="#F5A623" />
      <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>
        {avg_rating != null ? avg_rating.toFixed(1) : '—'}
      </span>
    </div>
    <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Calificación</div>
  </div>
  {/* Divisor vertical */}
  <div style={{ width: 1, background: '#F0EAE0' }} />
  {/* Trabajos */}
  <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>{jobs_count}</div>
    <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Trabajos</div>
  </div>
</div>
```

### Chips secundarios (fila, debajo del bloque)
`verified`, `zone` y `estimatedDuration` como chips con íconos lucide:

```tsx
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
```

---

## 2. Card "Servicios" — chips con ícono lucide

Reemplazar el chip actual (emoji + label naranja) por ícono lucide + label:

```tsx
{categories.map((c) => {
  const Icon = getCategoryIcon(c)
  return (
    <span key={c}
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
      style={{ background: '#FAF6F0', color: '#7A6E5E', border: '1px solid #ECE4D8' }}>
      {createElement(Icon, { size: 14, style: { color: '#D4571F' } })}
      {CATEGORY_LABELS[c] ?? c}
    </span>
  )
})}
```

Nota: usar `createElement` para renderizar el ícono (evita el error
`react-hooks/static-components` que apareció en Fase 1).

---

## 3. Cards del body — estilo premium unificado

Todas las cards del body (`Sobre mí`, `Servicios`, `Trabajos realizados`,
`Disponibilidad`) cambian su contenedor de:

```
style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}   // actual
```
a:
```
style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}
```

Los encabezados internos (`h3` "Sobre mí", etc.) actualizan color de `#555` a
`#8A7F6E`, manteniendo `text-xs font-bold uppercase tracking-widest`.

La sección de Reseñas (`ReviewsSection`) NO se toca — ya tiene su estilo.

---

## 4. CTA "Solicitar trabajo"

Se mantiene el botón fijo. Refinar solo:
- `borderRadius` del botón a 16 (de `rounded-2xl`).
- Sombra `0 6px 20px -6px rgba(232,104,58,.45)` (un poco más definida).

---

## Imports necesarios en ProfessionalProfile.tsx

Agregar a los imports de `lucide-react`: `Star`, `MapPin`, `Clock`, `BadgeCheck`.
Agregar `createElement` de `react`. Agregar `getCategoryIcon` al import de
`../../lib/categories`.

---

## Fuera de alcance (fases siguientes)

- Reseñas (ya premium), galería de portfolio interna, grilla de disponibilidad.
- Otras pantallas (Search header/filtros, Perfil cliente, Chat, Login/Registro).
- Migración a base blanca.

---

## Constraints

- No agregar dependencias — `lucide-react` ya instalado.
- Base crema se mantiene; no cambiar ancho ni layout general.
- Renderizar íconos dinámicos con `createElement` (regla `react-hooks/static-components`).
- No romper `CATEGORY_EMOJI` (otros consumidores lo usan).
- Preservar navegación, compartir, CTA y accesibilidad existentes.
- Correr `npm run lint` y `npm run build` antes de cada push.
