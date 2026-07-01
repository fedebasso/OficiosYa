# ⚠️ Bug latente: reviewService — mismatch de IDs

**Estado:** Sin resolver. Solo afecta cuando `IS_DEMO_MODE` esté desactivado (Supabase real conectado). En modo demo actual no se dispara.

**Archivos involucrados:**
- `src/services/reviewService.ts`
- SQL de la tabla `reviews` (ver `docs/superpowers/specs/2026-06-28-reviews-design.md`)

---

## El problema

La función RPC `refresh_professional_rating` actualiza la tabla `professionals`
buscando por su `id`:

```sql
update public.professionals
set avg_rating = (...), jobs_count = (...)
where id = pro_id;
```

Pero la tabla `reviews` guarda `professional_id` como **foreign key a `profiles(id)`**:

```sql
professional_id uuid not null references public.profiles(id)
```

Y `reviewService.submit()` pasa a la RPC el mismo `professionalId` que insertó en
`reviews.professional_id`:

```ts
await reviewService.refreshProfessionalRating(professionalId)
```

**Si en tu schema `professionals.id ≠ profiles.id`**, entonces:
- La reseña se guarda bien (apunta a `profiles.id`).
- Pero la RPC busca `professionals WHERE id = profiles.id` → no encuentra fila →
  `avg_rating` y `jobs_count` **nunca se actualizan**.

El resultado visible: el usuario deja la reseña, pero el rating del profesional
en las cards, el perfil y "Mejor calificados" no cambia.

---

## Cómo verificar (antes de activar en prod)

En el SQL Editor de Supabase, revisá la relación entre las dos tablas:

```sql
-- ¿professionals.id es igual a profiles.id (relación 1:1 con misma PK)?
-- o professionals tiene su propio id y una columna profile_id / user_id?
select column_name, data_type
from information_schema.columns
where table_name = 'professionals'
order by ordinal_position;
```

- **Caso A — `professionals.id` == `profiles.id`** (comparten PK, patrón 1:1):
  No hay bug. La RPC y el FK usan el mismo valor. Nada que hacer.

- **Caso B — `professionals` tiene su propio `id` + una columna `profile_id`
  (o `user_id`) hacia `profiles`:** Hay bug. Elegir una de las dos correcciones.

---

## Corrección (solo si estás en el Caso B)

### Opción 1 — Ajustar la RPC para resolver por la columna de vínculo

```sql
create or replace function refresh_professional_rating(pro_profile_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.professionals
  set
    avg_rating = (select round(avg(rating)::numeric, 1) from public.reviews where professional_id = pro_profile_id),
    jobs_count = (select count(*) from public.reviews where professional_id = pro_profile_id)
  where profile_id = pro_profile_id;   -- ← resolver por la FK real, no por professionals.id
end;
$$;
```

### Opción 2 — Guardar en `reviews.professional_id` el `professionals.id`

Cambiar el FK de la tabla `reviews` para referenciar `professionals(id)` en vez
de `profiles(id)`, y pasar `professional.id` (no el profile id) desde
`SolicitudDetail` / `ProfessionalProfile`. Requiere revisar qué id se está
pasando en `ReviewSheet` (`professionalId={req.professional_id}`).

**Recomendada:** Opción 1 si `professionals` ya tiene `profile_id`; es un cambio
de una sola función y no toca el frontend.

---

## Checklist al activar Supabase

- [ ] Verificar la relación `professionals` ↔ `profiles` (query de arriba)
- [ ] Si es Caso B, aplicar Opción 1 o 2
- [ ] Dejar una reseña de prueba y confirmar que `avg_rating` y `jobs_count`
      cambian en la tabla `professionals`
- [ ] Confirmar que el nuevo rating aparece en las cards y en "Mejor calificados"
