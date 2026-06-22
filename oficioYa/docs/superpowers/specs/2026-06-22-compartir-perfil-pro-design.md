# Diseño: Compartir Perfil del Profesional desde ProProfile

**Fecha:** 2026-06-22  
**Estado:** Aprobado

---

## Objetivo

El profesional puede compartir su propio perfil público desde su panel (`ProProfile`). La funcionalidad de compartir en el perfil público (`ProfessionalDetail` → `ProfessionalProfile`) ya existe y no se toca.

---

## Contexto del código existente

- `src/components/professionals/ProfessionalProfile.tsx` — ya tiene implementado `handleShare` con `navigator.share` + fallback a portapapeles + estado `shared`. Ya importa `Share2` y `Check` de lucide-react.
- `src/pages/pro/ProProfile.tsx` — panel del pro, header con botón "Editar". No tiene botón de compartir.
- URL pública del pro: `/profesional/:id` donde `id = user?.id`

---

## Cambio

Un solo archivo: `src/pages/pro/ProProfile.tsx`

### Imports a agregar

```tsx
import { Share2, Check } from 'lucide-react'
```

### Estado a agregar en el componente

```tsx
const [shared, setShared] = useState(false)
```

### Handler a agregar

```tsx
const handleShare = async () => {
  const url = `${window.location.origin}/profesional/${user?.id}`
  const proName = profile?.full_name ?? 'este profesional'
  const text = `Te recomiendo a ${proName} en OficioYa`
  if (navigator.share) {
    try {
      await navigator.share({ title: proName, text, url })
    } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }
}
```

### Botón en el header

Agregar junto al botón "Editar" existente (en el `flex items-center justify-between`):

```tsx
<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={handleShare}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
    style={{
      background: shared ? 'rgba(34,197,94,.12)' : '#F5F0E8',
      border: `1px solid ${shared ? 'rgba(34,197,94,.3)' : '#E8E0D4'}`,
      color: shared ? '#16A34A' : '#E8683A',
    }}
  >
    {shared ? <Check size={13} /> : <Share2 size={13} />}
    {shared ? 'Copiado' : 'Compartir'}
  </button>
  <button
    type="button"
    onClick={() => navigate('/pro/perfil/editar')}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
    style={{ background: 'rgba(232,104,58,0.12)', color: '#E8683A' }}
  >
    <Edit2 size={13} /> Editar
  </button>
</div>
```

---

## Lo que NO cambia

- `ProfessionalProfile.tsx` — ya tiene la funcionalidad completa
- `ProfessionalDetail.tsx` — sin cambios
- Cualquier otro archivo
