# Reseñas Reales — Design Spec

## Objetivo

Reemplazar las reseñas mock del perfil de profesionales por reseñas reales almacenadas en Supabase, con foto del trabajo, y mostrarlas en el perfil, cards de búsqueda y home.

---

## Alcance

- Solo clientes con trabajo completado pueden dejar reseña (request en estado `completed`)
- Reseña: estrellas (1-5) + comentario de texto (opcional) + foto del trabajo (opcional)
- Trigger automático: al pasar solicitud a `completed` aparece un bottom sheet de reseña
- Si el cliente cierra sin responder, se marca en localStorage y no vuelve a aparecer

---

## Base de datos (Supabase)

### Tabla `reviews`

| columna | tipo | descripción |
|---|---|---|
| `id` | `uuid` primary key | auto-generado |
| `created_at` | `timestamptz` | default `now()` |
| `request_id` | `uuid` FK → `requests.id` | garantiza trabajo real |
| `client_id` | `uuid` FK → `profiles.id` | autor de la reseña |
| `professional_id` | `uuid` FK → `profiles.id` | indexado para queries rápidas |
| `rating` | `int2` CHECK (1-5) | obligatorio |
| `comment` | `text` | nullable |
| `photo_url` | `text` | nullable, URL de Supabase Storage |

**Restricción:** `UNIQUE(request_id)` — una reseña por trabajo.

### Actualización de avg_rating

Función RPC `refresh_professional_rating(professional_id uuid)` que calcula AVG y COUNT de `reviews` y actualiza `profiles.avg_rating` y `profiles.jobs_count`. Se llama desde el cliente al insertar una reseña (no trigger, para simplicidad).

### Storage

Bucket `review-photos` (público) para las fotos de trabajos.

---

## Componentes nuevos / modificados

### Nuevos

- `src/services/reviewService.ts` — funciones: `submitReview()`, `fetchReviews(professionalId)`
- `src/components/requests/ReviewSheet.tsx` — bottom sheet completo con foto upload
- `src/components/professionals/ReviewCard.tsx` — card individual de reseña

### Modificados

- `src/components/professionals/ProfessionalProfile.tsx` — usa reseñas reales
- `src/components/professionals/ProfessionalCard.tsx` — muestra rating + cantidad
- `src/pages/SolicitudDetail.tsx` — muestra ReviewSheet cuando trabajo = completed
- `src/pages/Home.tsx` — sección "Mejor calificados"
- `src/hooks/useProfessionals.ts` — query con avg_rating para home

---

## Flujo de reseña

1. Solicitud pasa a estado `completed`
2. `SolicitudDetail` detecta el estado y comprueba `localStorage.getItem('reviewed_<requestId>')`
3. Si no fue reseñada: muestra `ReviewSheet` como bottom sheet
4. Usuario completa estrellas + comentario + foto opcional → llama `submitReview()`
5. `submitReview()` inserta en `reviews` + llama RPC para actualizar avg_rating
6. Se guarda `localStorage.setItem('reviewed_<requestId>', '1')`
7. Sheet se cierra con animación de éxito

---

## Visualización

### Perfil del profesional

- Rating general con número grande + barra de distribución por estrella
- Lista de reseñas reales: avatar del cliente (iniciales), nombre, fecha relativa, estrellas, comentario, foto (si existe)
- Eliminar datos mock completamente

### Cards de búsqueda (`ProfessionalCard`)

- Mostrar `★ 4.8 (23)` bajo el nombre cuando `avg_rating != null`
- Si no tiene reseñas: mostrar "Sin reseñas aún"

### Home — sección "Mejor calificados"

- Query: profesionales con `avg_rating >= 4.5` y `jobs_count >= 3`, ordenados por rating DESC, límite 4
- Mostrar como fila horizontal scrolleable con card compacta: foto/avatar, nombre, especialidad, rating

---

## Constraints

- No agregar dependencias nuevas para upload de foto (usar Supabase Storage JS SDK ya instalado)
- Foto máx 5MB, formatos: jpg/png/webp
- RLS en tabla `reviews`: solo el `client_id` puede insertar su propia reseña; lectura pública
- `avg_rating` se redondea a 1 decimal en la UI
