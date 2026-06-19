# Portfolio Profesional Mejorado — OficiosYa (Subsistema A)

**Fecha:** 2026-06-18  
**Estado:** Aprobado  
**Parte de:** Serie de mejoras al perfil profesional (A de 6)

---

## Objetivo

Permitir que los profesionales suban, gestionen y muestren una galería de trabajos realizados con fotos antes/después, vinculada opcionalmente a solicitudes completadas. Los clientes la ven en el perfil público del profesional junto al score y recomendaciones.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Estructura de fotos | `jsonb[]` con `{url, type: 'before'\|'after'\|'general'}` |
| Foto destacada | Pro elige una foto de su portfolio; se guarda en `professionals.featured_photo_url` |
| Vínculo trabajo→portfolio | Manual: botón "Agregar a portfolio" en solicitudes completadas |
| Ubicación de gestión | Tab "Mis Trabajos" dentro de `/pro/perfil` |
| Visualización pública | Grid 2 col + modal con tabs Antes/Después/General |
| Arquitectura DB | Extender `work_portfolio` existente (Opción A) |

---

## Base de datos

### Migración `work_portfolio`

```sql
ALTER TABLE work_portfolio
  ADD COLUMN IF NOT EXISTS photos      jsonb[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location    text,
  ADD COLUMN IF NOT EXISTS request_id  uuid REFERENCES requests(id),
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Migrar photo_urls existentes al nuevo formato
UPDATE work_portfolio
SET photos = (
  SELECT array_agg(jsonb_build_object('url', u, 'type', 'general'))
  FROM unnest(photo_urls) AS u
)
WHERE photo_urls != '{}' AND (photos IS NULL OR photos = '{}');
```

### Migración `professionals`

```sql
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS featured_photo_url text;
```

### Estructura de foto

```json
{ "url": "https://storage.supabase.co/...", "type": "before" | "after" | "general" }
```

---

## Tipos TypeScript

### `src/types/registration.ts` — actualizar `WorkPhoto` y `PortfolioItem`

```typescript
export interface WorkPhoto {
  url: string
  type: 'before' | 'after' | 'general'
}

export interface PortfolioItem {
  id: string
  professional_id: string
  title: string
  description: string | null
  work_date: string | null
  category: string | null
  photos: WorkPhoto[]        // reemplaza photo_urls (string[])
  location: string | null    // nuevo
  request_id: string | null  // nuevo — vínculo con solicitud
  is_featured: boolean       // nuevo
  created_at: string
}
```

---

## Servicios — `registrationService` (métodos nuevos)

```typescript
// Editar un trabajo existente
updatePortfolioItem(id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem>

// Marcar un trabajo como destacado (limpia is_featured en los demás y actualiza featured_photo_url)
toggleFeatured(proId: string, itemId: string, featuredPhotoUrl: string): Promise<void>
```

`addPortfolioItem` y `deletePortfolioItem` ya existen — no se modifican.

---

## Archivos nuevos

```
src/components/pro/portfolio/
  ProPortfolio.tsx          ← gestión completa (tab "Mis Trabajos" en ProProfile)
  PortfolioItemForm.tsx     ← formulario crear/editar (bottom sheet)
  PortfolioItemCard.tsx     ← card del grid en panel del pro
  PortfolioWorkModal.tsx    ← modal detalle con galería + tabs (perfil público)
```

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/types/registration.ts` | `WorkPhoto` interface + `PortfolioItem` actualizado |
| `src/services/registrationService.ts` | `updatePortfolioItem()`, `toggleFeatured()` |
| `src/pages/pro/ProProfile.tsx` | Tabs "Mis Datos" / "Mis Trabajos" — tab 2 renderiza `ProPortfolio` |
| `src/pages/ProfessionalDetail.tsx` | Hero con `featured_photo_url` + sección galería + `PortfolioWorkModal` |
| `src/pages/SolicitudDetail.tsx` | Botón "Agregar a portfolio" cuando `status === 'completed'` |
| `supabase/migrations/` | Nueva migración SQL |

---

## Panel del profesional — "Mis Trabajos"

### Ubicación

`/pro/perfil` con dos tabs:
```
[ Mis Datos ]  [ Mis Trabajos ]
```

### ProPortfolio.tsx

- Grid 2 columnas de `PortfolioItemCard`
- Botón "+" (top right) → abre `PortfolioItemForm` vacío
- Tap en card → abre `PortfolioItemForm` pre-rellenado (editar)
- Botón 🗑️ en card → confirma eliminación (modal), borra de DB

### PortfolioItemCard.tsx

Muestra:
- Foto principal (primera `after`, fallback `general`)
- Título
- Categoría con emoji + fecha
- Icono 📌 si `is_featured === true`
- Botones ✏️ editar / 🗑️ eliminar

### PortfolioItemForm.tsx (bottom sheet)

Campos:

| Campo | Tipo | Requerido |
|---|---|---|
| Título | texto | ✅ |
| Categoría | selector ALL_TRADES | ✅ |
| Descripción | textarea (max 300 chars) | — |
| Fecha aproximada | date picker | — |
| Ubicación | texto libre | — |
| Fotos generales | input file múltiple | mín 1 foto |
| Fotos antes | input file múltiple | — |
| Fotos después | input file múltiple | — |
| Marcar como destacado | toggle | — |

**Al activar "Marcar como destacado":**
1. Se llama `toggleFeatured(proId, itemId, url_primera_foto)`
2. `is_featured = false` en todos los otros trabajos del pro
3. `professionals.featured_photo_url` = URL de la primera foto del trabajo elegido

**Subida de fotos:** `registrationService.uploadFile('pro-portfolio', proId, file)` — sin cambios.

### Botón "Agregar a portfolio" en SolicitudDetail

Condición: `status === 'completed'` Y el viewer es el profesional de la solicitud.

Al presionar:
- Abre `PortfolioItemForm` pre-rellenado con:
  - `category` de la solicitud
  - `description` de la solicitud
  - `request_id` vinculado
- El pro puede editar todo antes de guardar

---

## Perfil público (`/profesional/:id`)

### Hero con foto destacada

Si `professional.featured_photo_url` existe:
- Reemplaza el gradiente/fondo actual del hero por la foto (con overlay oscuro para legibilidad del texto)
- Si no hay foto destacada: mantiene el gradiente actual (sin cambios visuales)

### Sección "Trabajos realizados"

Debajo de los indicadores de confianza existentes:

```
────────────────────────
  Trabajos realizados
────────────────────────
[ foto ] [ foto ]
[ foto ] [ foto ]
[ Ver todos los trabajos → ]  (si hay más de 4)
```

- Grid 2 columnas, fotos cuadradas
- Foto mostrada: primera `after`, fallback `general`
- Tap en foto → abre `PortfolioWorkModal`
- Estado vacío: "Aún no hay trabajos publicados"

### PortfolioWorkModal.tsx

Bottom sheet al tocar un trabajo:

```
[Título del trabajo]
[Categoría] · [Fecha] · [Ubicación]
[Descripción]

Tabs: [ General ] [ Antes ] [ Después ]

[  foto 1  ] [  foto 2  ]
[  foto 3  ] [  foto 4  ]
```

- Solo muestra tabs con fotos disponibles (no muestra tab vacía)
- Swipe/tap para navegar entre fotos de cada tipo

---

## Lo que NO cambia en esta fase

- Sistema de reputación y niveles (diferido, subsistema D)
- Optimización de imágenes / CDN (diferido, subsistema E)
- Pantalla de "Editar perfil profesional" general (subsistema C)
- Valoraciones de clientes (ya existe parcialmente, no se toca)
- Compresión automática de imágenes (diferido)

---

## Flujo completo

```
Pro termina trabajo → solicitud status='completed'
        ↓
Botón "Agregar a portfolio" en SolicitudDetail
        ↓
PortfolioItemForm pre-rellenado → pro agrega fotos antes/después
        ↓
Pro marca trabajo como destacado → featured_photo_url actualizado
        ↓
Cliente entra a /profesional/:id
        ↓
Hero muestra foto destacada
Grid muestra trabajos
Tap → PortfolioWorkModal con galería antes/después
        ↓
Cliente convencido → "Solicitar trabajo"
```
