# Compartir Perfil Profesional desde ProProfile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar botón "Compartir" en el header de `ProProfile` para que el pro pueda compartir su perfil público vía Web Share API.

**Architecture:** Un solo archivo modificado — `src/pages/pro/ProProfile.tsx`. Se replica el patrón ya existente en `ProfessionalProfile.tsx` (`handleShare` + estado `shared` + botón con feedback visual).

**Tech Stack:** React + TypeScript, Web Share API, Clipboard API, lucide-react (`Share2`, `Check`)

## Global Constraints

- Naranja primario: `#E8683A`, verde feedback: `rgba(34,197,94,.12)` / `#16A34A`
- `font-bold` en botones, `rounded-xl` para botones del header
- TypeScript estricto — `npx tsc -b` debe dar 0 errores
- Git commits desde `C:\Users\fede8\OficiosYa` (root del repo)

---

## File Map

| Archivo | Acción |
|---------|--------|
| `src/pages/pro/ProProfile.tsx` | Modificar — agregar imports, estado, handler y botón |

---

## Task 1: Botón compartir en `ProProfile.tsx`

**Files:**
- Modify: `src/pages/pro/ProProfile.tsx`

- [ ] **Step 1: Agregar imports de `Share2` y `Check`**

En la línea de imports de lucide-react (ya existe `import { Edit2, LogOut, Phone, MapPin, Star, Briefcase, CheckCircle } from 'lucide-react'`), agregar `Share2` y `Check`:

```tsx
import { Edit2, LogOut, Phone, MapPin, Star, Briefcase, CheckCircle, Share2, Check } from 'lucide-react'
```

- [ ] **Step 2: Agregar estado `shared` dentro del componente `ProProfile`**

Después de `const [activeTab, setActiveTab] = useState<'datos' | 'trabajos'>('datos')`, agregar:

```tsx
const [shared, setShared] = useState(false)
```

- [ ] **Step 3: Agregar el handler `handleShare`**

Después del `useEffect` existente, agregar:

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

- [ ] **Step 4: Reemplazar el botón "Editar" en el header por dos botones en un flex row**

Buscar en el header:
```tsx
<button
  type="button"
  onClick={() => navigate('/pro/perfil/editar')}
  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
  style={{ background: 'rgba(232,104,58,0.12)', color: '#E8683A' }}
>
  <Edit2 size={13} /> Editar
</button>
```

Reemplazar por:
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

- [ ] **Step 5: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 6: Verificar visualmente**

Correr `npm run dev` desde `C:\Users\fede8\OficiosYa\oficioYa`. Navegar a `/pro/perfil`. Verificar:
- Header muestra botones "Compartir" y "Editar" juntos ✓
- En mobile: tocar "Compartir" abre el menú nativo del sistema ✓
- En escritorio (sin Web Share API): tocar "Compartir" cambia el botón a "✓ Copiado" verde por 2 segundos ✓
- Después de 2 segundos el botón vuelve a "Compartir" naranja ✓

- [ ] **Step 7: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/pro/ProProfile.tsx
git commit -m "feat: botón compartir perfil en ProProfile"
```

---

## Self-Review

**Spec coverage:**
- ✅ Imports `Share2` y `Check` — Step 1
- ✅ Estado `shared: boolean` — Step 2
- ✅ `handleShare` con `navigator.share` + fallback portapapeles — Step 3
- ✅ Botón junto a "Editar" con feedback visual — Step 4
- ✅ URL: `${window.location.origin}/profesional/${user?.id}` — Step 3
- ✅ `ProfessionalProfile.tsx` sin cambios — no aparece en File Map

**Placeholder scan:** Sin TBDs. Código completo en cada step.

**Type consistency:** `shared: boolean`, `useState(false)` — consistente. `user?.id` es `string | undefined` — la URL puede resultar en `/profesional/undefined` si el usuario no está cargado, pero `ProProfile` es una ruta protegida (`ProtectedRoute`) y `user` siempre existe cuando se llega a esta página.
