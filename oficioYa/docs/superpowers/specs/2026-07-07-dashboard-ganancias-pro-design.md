# Spec — Dashboard de Ganancias del Profesional (estilo Uber)

> Fecha: 2026-07-07 · Estado: aprobado para plan
> App: OFIX / OficiosYa (PWA React+Vite, modo demo, Supabase aún NO conectado)

## Objetivo

Que el profesional vea el dinero que genera **por trabajo, por día, por semana y total histórico**, con gráficas, al nivel visual del resto de la app. Funciona 100% en modo demo y se actualiza al instante cuando un trabajo pasa a `completed`. Referencia de UX: pantalla de "Ganancias" del conductor de Uber.

## Contexto real del código (verificado)

- **Lado pro usa `proRequestsStore`** (no `requestStore`). Array en memoria (`MOCK_INCOMING`, 2 solicitudes). **Nada persiste al refresh hoy.**
- El pro marca `completed` en **dos puntos**: `ActiveJobCard` del Dashboard (`ProDashboard.tsx`) y la card de `ProRequests.tsx`.
- **No existe botón "Reiniciar demo"** — solo "Cerrar sesión" en `ProProfile.tsx`.
- Pro demo: `mock-pro-1` (Carlos Méndez). Pro nuevo registrado: id `mock-${timestamp}`.
- Paleta: primario **`#E8683A`** (naranja de marca), crema fondo **`#F5F0E8`**. Los estados de solicitud usan azul `#2563EB` para `completed`.
- `ProBottomNav` tiene 4 tabs (Dashboard, Solicitudes, Agenda, Perfil). Hay lugar para una 5ª.
- Chat mock ya persiste con prefijo `ofix_` y usa mensajes tipo `system`.

## Decisiones de diseño (aprobadas)

1. **Fuente de datos = dataset propio persistido** `ofix_earnings` en localStorage (patrón idéntico al mock del chat). NO se persisten los request stores. Disparador único de escritura: completar un trabajo. Idempotente por `requestId` (upsert), así completar dos veces o corregir monto reemplaza y nunca desincroniza.
2. **Limpieza en "Cerrar sesión"**: al hacer signOut se limpia `ofix_earnings`. Al reentrar como `mock-pro-1`, el seed se regenera fresco (equivale a "reiniciar demo").
3. **Acceso = 5ª entrada del bottom nav** ("Ganancias"). El Dashboard NO se toca (no se agregan cards nuevas).
4. **Seed solo para `mock-pro-1`**. Otros proId → earnings vacío (pro nuevo ve estado vacío prolijo).
5. **Sin librerías nuevas**: gráficas propias con divs + framer-motion. `recharts` solo como último recurso autorizado si queda inmanejable.

---

## A. Modelo de datos

En `src/store/requestStore.ts`, extender `ServiceRequest` con opcionales (no rompe nada):

```ts
final_amount?: number | null   // pesos uruguayos cobrados
completed_at?: string | null   // ISO al pasar a completed
```

Dataset de ganancias (`ofix_earnings`), tipo interno:

```ts
interface EarningJob {
  requestId: string
  proId: string
  clientName: string
  category: string
  amount: number       // > 0, entero (sin decimales)
  completedAt: string  // ISO
}
```

## B. `src/services/earningsService.ts`

Interfaz pública (async, para que la migración a Supabase sea directa):

```ts
export interface EarningsSummary {
  today: number; thisWeek: number; total: number
  jobsToday: number; jobsThisWeek: number; jobsTotal: number
  avgPerJob: number
  bestDay: { date: string; amount: number } | null
}
export interface DailyEarning { date: string /* YYYY-MM-DD */; amount: number; jobs: number }
export interface EarningJobView {
  requestId: string; clientName: string; category: string; amount: number; completedAt: string
}

export const earningsService = {
  getSummary(proId: string): Promise<EarningsSummary>
  getDailySeries(proId: string, days: number): Promise<DailyEarning[]>       // últimos N días, incluye ceros
  getWeekSeries(proId: string, weekOffset: number): Promise<DailyEarning[]>  // 7 días L-D, 0 = actual, -1 = anterior
  getJobs(proId: string, from?: string, to?: string): Promise<EarningJobView[]> // desc
  recordJob(job: EarningJob): Promise<void>   // upsert por requestId
  clearDemo(): void                            // limpia ofix_earnings (llamado en signOut)
}
```

Reglas:
- **Toda la agregación vive en el servicio.** Los componentes solo pintan.
- **Sanitización** al leer localStorage: descarta entradas con `amount` no numérico, `≤ 0`, o campos faltantes (mismo criterio que el type guard del chat). Corrupto → se ignora esa entrada, nunca rompe.
- **Semana = lunes a domingo**, timezone del dispositivo. Cuidado con `getDay()` (domingo = 0).
- **Redondeo**: enteros, sin decimales.
- **Seed** (`ensureLoaded`): si es `mock-pro-1` y no hay datos, sembrar **25–35 trabajos** distribuidos en las últimas 5 semanas. Montos $U 800–15.000, mayoría $U 1.500–6.000. Horarios variados. Algunos días en cero. Nombres de cliente y categorías realistas (fallbacks "Cliente"/"Servicio"). Persistir en `ofix_earnings`.
- **Ramas Supabase** escritas (query agregada a tabla `requests` filtrando `status='completed'` con `final_amount`) pero sin probar, gated por `IS_DEMO_MODE`.

## C. Modal de monto (compartido) — `CompleteJobSheet`

- Bottom sheet: **"¿Cuánto cobraste por este trabajo?"**, input numérico grande, `inputMode="decimal"`, validación `> 0` y `≤ 500.000`. Sin monto no se completa.
- Se abre interceptando el botón de completar existente en **ambos** puntos (`ActiveJobCard` en Dashboard y card de `ProRequests`). No agrega UI nueva salvo el sheet.
- Al confirmar, handler común:
  1. `updateStatus(id, 'completed')` con `final_amount` + `completed_at = now` (actualización optimista).
  2. `earningsService.recordJob({...})`.
  3. Mensaje `system` en el chat de esa solicitud: **"Trabajo finalizado — $U X.XXX"** (reusa tipo `system` existente; único cambio permitido al chat).
  4. Toast discreto: **"Sumaste $U X.XXX · Ver ganancias"** → navega a `/pro/ganancias`.

## D. Pantalla `/pro/ganancias`

Ruta **lazy** en `AnimatedRoutes` dentro de `ProtectedRoute`. Envuelta en el ErrorBoundary global existente. Layout con `100dvh`/scroll ya establecido (no reintroducir `100vh`).

- **Tabs** `Hoy · Semana · Total` (pills, selección animada con framer-motion).
- **Número protagonista**: ≥ 40px bold, `Intl.NumberFormat('es-UY', { style:'currency', currency:'UYU', maximumFractionDigits: 0 })`, `font-variant-numeric: tabular-nums`, **count-up ~600ms** (hook propio `useCountUp`, sin lib). Subtítulo con contexto ("8 trabajos esta semana" / "3 trabajos hoy").
- **Comparativa vs período anterior**: "▲ 23% vs semana pasada" verde, "▼" rojo suave, "=" gris. Guardas anti-NaN/Infinity: si el período anterior fue 0 → "Primera semana con actividad".
- **Gráfica de barras propia** (divs + framer-motion, sin librerías):
  - Vista Semana: 7 barras L→D, altura proporcional, día actual en `#E8683A`, resto atenuado (mismo color, menor opacidad). Tap en barra → detalle (monto + nº trabajos). Flechas ‹ › navegan semanas (`getWeekSeries` con offset); › deshabilitada en semana actual. Barras entran creciendo desde 0 (stagger sutil).
  - Vista Total: barras por semana (últimas 8 semanas).
- **Vista Hoy**: número del día + lista de trabajos de hoy. Vacío → estado amable ("Todavía no completaste trabajos hoy") consistente con estados vacíos existentes.
- **Vista Total**: total histórico + cards chicas (trabajos totales, promedio por trabajo, mejor día con monto y fecha) + gráfica por semana.
- **Lista "Últimos trabajos"** (Semana y Total): filas con categoría/oficio, nombre cliente (fallback "Cliente"), fecha relativa ("hoy 14:30", "ayer", "lun 2/7") y monto a la derecha en semibold. Tap → `/solicitud/:id`. Máx 10 + "Ver todos" si hay más.
- **Skeleton loading** coherente con el del chat (nunca spinner full-screen).

## E. Acceso — 5ª entrada del bottom nav

En `ProBottomNav.tsx`, agregar 5ª tab **"Ganancias"** (ícono `Wallet` o `DollarSign` de lucide), `to: '/pro/ganancias'`, activo en `#E8683A` como las demás. **El Dashboard no se modifica.**

## F. Utilidades nuevas

- `formatUYU(n)` — wrapper de `Intl.NumberFormat('es-UY', UYU, 0 dec)`.
- Helpers de semana L-D (inicio/fin de semana, iterar 7 días) cuidando `getDay()` domingo=0 y timezone del dispositivo.
- `useCountUp(target, ms)` — hook de animación de conteo.

## Robustez

- Nunca rompe con datos vacíos: pro nuevo ve estados vacíos y `$ 0` formateado, nunca NaN.
- `final_amount`/`amount` inválido en localStorage → se ignora esa entrada en las agregaciones.
- Cliente sin nombre / categoría faltante → fallbacks ("Cliente", "Servicio").
- Pantalla envuelta en ErrorBoundary global.

## Criterios de aceptación

- [ ] Completar un trabajo con monto → aparece al instante en Hoy, Semana y Total, con animación de conteo.
- [ ] Navegación de semanas anteriores funciona; la actual no permite ir al futuro (› deshabilitada).
- [ ] Comparativa vs período anterior correcta en los 3 casos (sube, baja, sin datos previos).
- [ ] Refresh de la página → todo persiste (localStorage `ofix_earnings`).
- [ ] "Cerrar sesión" limpia `ofix_earnings`; reentrar como demo regenera el seed.
- [ ] Pro nuevo sin trabajos → cero estados rotos, cero NaN.
- [ ] `npm run build` y `npm run lint` limpios.
- [ ] Probado en 360px de ancho y con teclado abierto en el modal de monto.

## Qué NO hacer

- No conectar Supabase (dejar ramas escritas, sin probar).
- No instalar librerías (recharts solo último recurso autorizado).
- No duplicar montos en varios stores: el disparador único es completar el trabajo, upsert por `requestId`.
- No usar colores fuera de la paleta ni gradientes nuevos.
- No tocar el flujo del chat más allá del mensaje `system` de completar.
- No agregar cards al Dashboard: el acceso es la 5ª tab del bottom nav.

## Nota de producto

Hoy `final_amount` se ingresa manual al completar. Más adelante saldrá del presupuesto aceptado post-visita de constatación. Mantener el mismo nombre de campo para que la migración sea directa.

## Estilo de trabajo

Commit al terminar cada fase con build en verde (evitar perder trabajo por cierres inesperados).
