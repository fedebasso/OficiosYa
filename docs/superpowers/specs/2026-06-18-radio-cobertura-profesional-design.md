# Spec: Sub-proyecto B — Radio de cobertura del profesional

**Fecha:** 2026-06-18  
**Estado:** Aprobado

## Objetivo

Cada profesional define un radio de cobertura en km desde su barrio base. Las solicitudes fuera de ese radio no le llegan. Los clientes solo ven profesionales que cubren su barrio.

## Archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `oficioYa/src/hooks/useProfessionals.ts` | Modify | Agregar `radius_km: number \| null` a `Professional` |
| `oficioYa/src/data/mockProfessionals.ts` | Modify | Agregar `radius_km` a cada pro del mock |
| `oficioYa/src/lib/barrio-coords.ts` | Create | Coordenadas lat/lng por barrio + Haversine |
| `oficioYa/src/pages/TicketFlow.tsx` | Modify | Filtro por radio en `ResultsStep` + indicador en cards |
| `oficioYa/src/pages/pro/ProRequests.tsx` | Modify | Filtrar solicitudes por radio del pro |
| `oficioYa/src/pages/pro/ProOnboarding.tsx` | Modify | Selector de radio en onboarding |
| `oficioYa/src/pages/pro/ProProfile.tsx` | Modify | Selector de radio editable en perfil |

---

## Parte 1: Tipo `Professional`

Agregar campo a la interfaz `Professional` en `src/hooks/useProfessionals.ts`:

```ts
radius_km: number | null
```

- `null` = cubre toda Montevideo (puede cobrar traslado)
- Número positivo = radio en km desde su `zone` base

---

## Parte 2: Mock data — `radius_km` por profesional

Valores en `src/data/mockProfessionals.ts`:

| ID | Nombre | Zone | radius_km |
|---|---|---|---|
| 1 | Carlos Méndez | Pocitos | 8 |
| 6 | Martín Suárez | Carrasco | 5 |
| 7 | Luis Cabrera | Cordón | null |
| 2 | Roberto Silva | Malvín | 6 |
| 8 | Andrés Pereira | Punta Carretas | 10 |
| 3 | Diego Fernández | Centro | null |
| 9 | Fabián Moreira | Buceo | 7 |
| 4 | Ana Rodríguez | Centro | null |
| 10 | Sergio Núñez | La Blanqueada | 4 |
| 5 | Pablo Torres | Punta Carretas | 12 |
| 11 | Gabriel Ríos | Parque Batlle | null |

---

## Parte 3: `src/lib/barrio-coords.ts`

Coordenadas aproximadas (lat/lng) de barrios de Montevideo. Cubre al menos los barrios del mock y los principales del cliente:

```ts
export const BARRIO_COORDS: Record<string, { lat: number; lng: number }> = {
  'Pocitos':         { lat: -34.9050, lng: -56.1580 },
  'Punta Carretas':  { lat: -34.9150, lng: -56.1530 },
  'Carrasco':        { lat: -34.8850, lng: -56.0500 },
  'Malvín':          { lat: -34.8950, lng: -56.1100 },
  'Buceo':           { lat: -34.8980, lng: -56.1350 },
  'Centro':          { lat: -34.9060, lng: -56.1900 },
  'Cordón':          { lat: -34.9020, lng: -56.1780 },
  'La Blanqueada':   { lat: -34.8900, lng: -56.1700 },
  'Parque Batlle':   { lat: -34.8940, lng: -56.1620 },
  'Punta Gorda':     { lat: -34.9020, lng: -56.1100 },
  'Tres Cruces':     { lat: -34.8980, lng: -56.1810 },
  'Palermo':         { lat: -34.9050, lng: -56.1820 },
  'Barrio Sur':      { lat: -34.9120, lng: -56.1950 },
  'Ciudad Vieja':    { lat: -34.9080, lng: -56.2030 },
  'Aguada':          { lat: -34.9000, lng: -56.1920 },
  'Goes':            { lat: -34.8920, lng: -56.1840 },
  'La Teja':         { lat: -34.8870, lng: -56.2130 },
  'Cerro':           { lat: -34.8850, lng: -56.2400 },
  'Prado':           { lat: -34.8800, lng: -56.1980 },
  'Capurro':         { lat: -34.8880, lng: -56.2050 },
  'Sayago':          { lat: -34.8750, lng: -56.2200 },
  'Nuevo París':     { lat: -34.8700, lng: -56.2300 },
  'Unión':           { lat: -34.8800, lng: -56.1560 },
  'Jacinto Vera':    { lat: -34.8870, lng: -56.1660 },
  'Larrañaga':       { lat: -34.8830, lng: -56.1740 },
  'Maroñas':         { lat: -34.8750, lng: -56.1480 },
  'Flor de Maroñas': { lat: -34.8700, lng: -56.1450 },
  'Piedras Blancas': { lat: -34.8650, lng: -56.1200 },
  'Manga':           { lat: -34.8600, lng: -56.1350 },
  'Reducto':         { lat: -34.8960, lng: -56.1860 },
  'Peñarol':         { lat: -34.8600, lng: -56.2000 },
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function distanceBetweenBarrios(b1: string, b2: string): number | null {
  const c1 = BARRIO_COORDS[b1]
  const c2 = BARRIO_COORDS[b2]
  if (!c1 || !c2) return null

  const R = 6371 // km
  const dLat = toRad(c2.lat - c1.lat)
  const dLng = toRad(c2.lng - c1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isInRadius(proZone: string, radiusKm: number | null, clientZone: string): boolean {
  if (!clientZone) return true
  if (radiusKm === null) return true
  const d = distanceBetweenBarrios(proZone, clientZone)
  if (d === null) return true // sin coordenadas → no filtrar
  return d <= radiusKm
}
```

---

## Parte 4: Filtro en `ResultsStep` + indicador en cards

### Filtro duro antes del scoring

En `ResultsStep` de `src/pages/TicketFlow.tsx`:

```ts
const { professionals } = useProfessionals(category)

const inRange = professionals.filter((p) =>
  isInRadius(p.zone, p.radius_km, clientZone)
)

const sorted = inRange
  .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
  .sort((a, b) => b.score - a.score)
  .map(({ pro }) => pro)
```

### Indicador en cards de profesional

En la card de cada profesional dentro de `ResultsStep`, debajo del nombre/especialidad, agregar:

```tsx
<span className="text-[9px] font-bold" style={{ color: '#AAA' }}>
  {pro.radius_km === null ? '🌍 Toda la ciudad' : `📍 ${pro.zone} · ${pro.radius_km} km`}
</span>
```

---

## Parte 5: Filtro en `ProRequests`

Al inicio del componente `ProRequests`, filtrar las solicitudes visibles:

```ts
// Obtener el pro logueado (ya existe en el hook useIncomingRequests)
// Filtrar requests que están dentro del radio
const visibleRequests = requests.filter((req) =>
  isInRadius(pro.zone, pro.radius_km, req.location ?? '')
)
// Usar visibleRequests en vez de requests para calcular pending/active/others
```

**Nota:** El pro logueado en `ProRequests` se obtiene desde `useAuthStore`. Para el filtro, necesitamos el `zone` y `radius_km` del profesional autenticado. En modo demo, usar los datos del mock filtrando por `user.id`.

Para modo demo: usar `MOCK_PROFESSIONALS.find(p => p.profiles.id === user?.id)` para obtener el pro con su `zone` y `radius_km`.

---

## Parte 6: Selector de radio — opciones

```ts
const RADIO_OPTIONS = [
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'Toda la ciudad', value: null },
]
```

UI: fila de chips horizontales, misma estética que el resto del app (naranja cuando seleccionado).

### En `ProOnboarding`

Agregar después del selector de zona del profesional (si existe) o antes del botón de guardar. El valor default: `null` (toda la ciudad).

### En `ProProfile`

Agregar como campo editable en la sección de datos del perfil. Misma UI que en onboarding.

---

## Comportamientos de borde

- Cliente sin zona seleccionada → no filtrar → mostrar todos los profesionales
- Profesional con `radius_km = null` → siempre visible para cualquier cliente
- Barrio sin coordenadas en la tabla → no filtrar (beneficio de la duda)
- Solicitud sin `location` → visible para todos los profesionales

## Fuera de scope

- GPS real para calcular coordenadas exactas
- Mostrar el radio como círculo en un mapa
- Cobro automático del fee de traslado
- Notificar al profesional cuando expanden su radio
