# AUDIT — OFIX

> La auditoría completa (P2) se desarrollará en su fase. Este archivo arranca
> registrando hallazgos detectados durante P1 para no perderlos.

## Hallazgos detectados durante P1 (a resolver en P2)

### [Alta] Fetch a Supabase sin guard de modo demo → errores de consola
En modo demo (`IS_DEMO_MODE`), varios componentes llaman directo a Supabase y
pegan contra `placeholder.supabase.co`, generando errores de red en consola
(`ERR_NAME_NOT_RESOLVED` / `ERR_FAILED`). No rompen la UI (usan datos mock como
fallback), pero ensucian la consola y hacen requests inútiles.

- `src/components/home/TopRated.tsx:21` → tabla `professionals` (4 errores en Home)
- `src/pages/ProfessionalDetail.tsx` → tabla `reviews` (errores al abrir un perfil)
- Revisar el resto de componentes/servicios que usan `supabase.from(...)` sin
  chequear `IS_DEMO_MODE` primero (patrón a auditar en P2).

**Fix sugerido (P2):** cortocircuitar con datos mock cuando `IS_DEMO_MODE` está
activo, antes de invocar `supabase`, de forma consistente en toda la app.
