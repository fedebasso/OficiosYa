# AUDIT — OFIX (P2)

**Fecha:** 2026-07-02 · **Modo:** demo (`IS_DEMO_MODE=true`, sin Supabase)
**Método:** recorrido runtime con Playwright a 390×844 (Android gama media) +
revisión de código. Por cada feature: happy path + ≥2 edge cases.
**Regla de fase:** primero auditar todo, después arreglar Crítica→Alta→Media→Baja.
No se avanza a P3 hasta que las features existentes funcionen.

Leyenda estado: ✅ ok · ⚠️ funciona con problema · ❌ roto

---

## 1. Inventario de features y resultados

### Autenticación (compartida)
| Feature | Happy path | Edge cases | Estado |
|---|---|---|---|
| Login (`/login`) | `cliente@demo.com`/`demo123` → `/` ✅ | Credenciales inválidas → "Credenciales incorrectas" ✅ · quick-login pro → `/pro/dashboard` ✅ | ✅ |
| Registro (`/registro`) | mock user en localStorage (código) | rol client/professional | ✅ (code review) |
| Logout | limpia `ofix_mock_user` ✅ | — | ✅ |
| Sesión persistente | localStorage `ofix_mock_user` ✅ | sin sesión → guest ✅ | ✅ |

### Cliente
| Feature | Happy path | Edge cases | Estado |
|---|---|---|---|
| Home (`/`) | carga, categorías, destacados ✅ | — | ⚠️ (A1: errores consola TopRated) |
| Búsqueda inline (Home) | "plomero"→Sanitario→`/buscar/plomero` ✅ | tildes/mayúsc ("ALBAÑIL") ✅ · sin match → estado vacío ✅ | ✅ (P1.3) |
| Search / categoría (`/buscar/:cat`) | `/buscar/plomero` → 2 pros ✅ | pro es redirigido a dashboard ✅ (rol) | ✅ |
| Detalle profesional (`/profesional/:id`) | render Roberto Silva, agenda ✅ | — | ⚠️ (A1: reviews + work_portfolio) |
| Flujo IA / Ticket (`/ticket`) | "caño pierde agua"→infiere Sanitario→pros ordenados ✅ | foto opcional ✅ · barrio opcional ✅ · <10 chars bloquea ✅ | ⚠️ (M1: copy "tres campos") |
| Favoritos (`/favoritos`) | carga sin errores ✅ | vacío (code) | ✅ |
| Mis solicitudes (`/mis-solicitudes`) | carga sin errores ✅ | vacío (code) | ✅ |
| Perfil cliente (`/perfil`) | carga sin errores ✅ | — | ✅ |
| Urgencias (`/urgencias`) | carga sin errores ✅ | — | ✅ |
| Solicitar servicio (`/solicitar/:id`) | — | (Solicitar en detalle → `/ticket`, ver O1) | ⚠️ (O1) |

### Profesional
| Feature | Happy path | Edge cases | Estado |
|---|---|---|---|
| Dashboard (`/pro/dashboard`) | carga, toggle disponibilidad ✅ | — | ✅ |
| Solicitudes (`/pro/solicitudes`) | carga sin errores ✅ | — | ✅ |
| Perfil pro (`/pro/perfil`) | carga sin errores ✅ | — | ✅ |
| Editar perfil (`/pro/perfil/editar`) | carga sin errores ✅ | — | ✅ |
| Trabajos (`/pro/trabajos`) | carga sin errores ✅ | — | ✅ |
| Disponibilidad (`/pro/disponibilidad`) | carga sin errores ✅ | — | ✅ |
| Onboarding pro (`/pro/onboarding`) | carga sin errores ✅ | — | ✅ |
| Registro pro (`/pro/registro`) | carga ✅ | — | ⚠️ (A1: registrationService) |
| Portfolio (subir/editar item) | — | — | ⚠️ (A1: PortfolioItemForm/useRegistration, code review) |

### Admin / otros
| Feature | Happy path | Edge cases | Estado |
|---|---|---|---|
| Verificaciones (`/admin/verificaciones`) | carga ✅ | — | ⚠️ (A1: AdminVerificaciones) |
| Servicios oficiales (`/servicios-oficiales`) | detrás de `FEATURES.SERVICIOS_OFICIALES` (off, Fase 2) | pro → redirige a dashboard ✅ | ✅ (flag off) |
| 404 (`NotFound`) | ruta inexistente | — | ✅ (code) |
| Navegación instantánea | sin transiciones ni splash ✅ (P1.2) | — | ✅ |

---

## 2. Hallazgos (a resolver en esta fase)

### Crítica
_Ninguna._ No se encontró feature completamente rota ni crash de app.

### Alta

**[A1] ✅ RESUELTO — Fetch a Supabase sin guard `IS_DEMO_MODE` → errores de consola en demo**
_Fix commit `fix(P2-A1)`. Verificado: Home, `/profesional/:id`, `/pro/registro`,
`/admin/verificaciones` y ambos flujos completos cargan con 0 errores._
En modo demo varios componentes/servicios llaman directo a Supabase y pegan
contra `placeholder.supabase.co` (`ERR_NAME_NOT_RESOLVED` / `ERR_FAILED`).
No rompen la UI (hay fallback a mock/vacío) pero ensucian la consola, hacen
requests inútiles y en gama baja con conexión lenta agregan latencia/retries.
Ubicaciones confirmadas en runtime + code review:
- `src/components/home/TopRated.tsx:21` → `professionals` (Home)
- `src/services/reviewService.ts` → `reviews` (detalle profesional)
- `src/services/registrationService.ts` → `work_portfolio` (detalle profesional + `/pro/registro`)
- `src/hooks/useRegistration.ts` → registro pro
- `src/components/pro/portfolio/PortfolioItemForm.tsx` → alta de portfolio
- `src/pages/pro/ProRegistration.tsx` → registro pro
- `src/pages/admin/AdminVerificaciones.tsx` → panel admin

**Fix:** cortocircuitar con datos mock (o retorno vacío) cuando `IS_DEMO_MODE`
está activo, ANTES de invocar `supabase`, de forma consistente. Patrón ya usado
en `authService`, `professionalService`, `requestService`, etc.

### Media

**[M1] ✅ RESUELTO — Copy engañosa en el paso 1 del flujo IA (`TicketFlow`)**
_Fix commit `fix(P2-M1)`. Subtítulo ahora: "Describí el problema. La foto y el
barrio son opcionales"._
El subtítulo dice "Completá los tres campos para continuar", pero solo la
descripción (≥10 chars) es obligatoria: foto y barrio están rotulados
"opcional". Confunde y sugiere que faltan datos. Ajustar copy a la realidad
(p. ej. "Describí el problema. La foto y el barrio son opcionales").

### Baja

**[B1] ✅ RESUELTO — Pro accede a rutas top-level de cliente sin redirección**
_Fix commit `fix(P2-B1)`. Nuevo guard `ClientRoute` redirige al pro a
`/pro/dashboard` en `/ticket`, `/urgencias`, `/profesional/:id`, `/solicitar/:id`
y servicios oficiales. Verificado en runtime._
Las rutas bajo `ClientLayout` sí redirigen al pro a su dashboard, pero las
top-level (`/ticket`, `/urgencias`, `/profesional/:id`) no. Un pro logueado
puede entrar al flujo de cliente. Impacto bajo (no hay daño de datos), pero es
inconsistente con la separación de roles.

---

## 3. Observaciones (no bloqueantes)

**[O1] ✅ RESUELTO** — "Solicitar trabajo" ahora lleva a `/solicitar/:id`
(`RequestService`, flujo directo con wizard). Fix commit `fix(P2-O1)`.

**[O2] ✅ RESUELTO** — `SplashScreen.tsx` (huérfano tras P1.2) eliminado.
Fix commit `chore(P2-O2)`.
