# Spec: Sub-proyecto A — Zona/barrio mejorada

**Fecha:** 2026-06-18  
**Estado:** Aprobado

## Objetivo

Reemplazar el selector de 9 chips de zona por un bottom sheet con todos los barrios de Montevideo. Persistir el barrio seleccionado en `ServiceRequest.location` y mostrarlo en `SolicitudDetail`.

## Archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `oficioYa/src/lib/barrios.ts` | Create | Lista completa de barrios de Montevideo |
| `oficioYa/src/pages/TicketFlow.tsx` | Modify | Bottom sheet de barrios en MediaStep + pasar zone al navigate |
| `oficioYa/src/pages/TicketConfirm.tsx` | Modify | Recibir zone del state, pasarlo como `location` en addRequest |
| `oficioYa/src/pages/SolicitudDetail.tsx` | Modify | Mostrar `req.location` en tarjeta de descripción |

---

## Parte 1: `src/lib/barrios.ts`

Lista completa de barrios oficiales de Montevideo ordenados alfabéticamente:

```ts
export const BARRIOS_MONTEVIDEO: string[] = [
  'Aguada', 'Aire Puro', 'Atahualpa', 'Bañados de Carrasco',
  'Barrio Sur', 'Belvedere', 'Brazo Oriental', 'Buceo',
  'Capurro', 'Carrasco', 'Carrasco Norte', 'Casabó',
  'Casavalle', 'Castro', 'Centro', 'Cerrito',
  'Cerro', 'Ciudad Vieja', 'Colón Centro', 'Colón Noroeste',
  'Conciliación', 'Cordón', 'Flor de Maroñas', 'Goes',
  'Ituzaingó', 'Jacinto Vera', 'La Blanqueada', 'La Comercial',
  'La Figurita', 'La Teja', 'La Unión', 'Larrañaga',
  'Las Acacias', 'Las Canteras', 'Lezica', 'Madureira',
  'Malvín', 'Malvín Norte', 'Manga', 'Maroñas',
  'Mercado Modelo', 'Millán', 'Montevideo Rural',
  'Nuevo París', 'Palermo', 'Parque Batlle', 'Parque Rodó',
  'Paso de la Arena', 'Paso de las Duranas', 'Penarol',
  'Piedras Blancas', 'Pocitos', 'Prado', 'Punta Carretas',
  'Punta Gorda', 'Reducto', 'Rincón de Millán', 'Sayago',
  'Talar de Punta Gorda', 'Toledo Chico', 'Tres Cruces',
  'Tres Ombúes', 'Unión', 'Villa Española', 'Villa García',
  'Villa Muñoz', 'Villa del Cerro',
]
```

---

## Parte 2: Bottom sheet de barrios en `MediaStep`

### Comportamiento

- Botón trigger: `📍 Seleccioná tu barrio` (sin selección) o `📍 Pocitos ×` (con selección)
- Al tocar → overlay oscuro + panel blanco desde abajo (bottom sheet)
- Panel: título "¿En qué barrio?", lista scrolleable con todos los barrios, búsqueda opcional descartada (YAGNI)
- Toque en barrio → selecciona, cierra sheet, `onChange({ zone: barrio })`
- Toque en `×` del botón trigger → deselecciona (`onChange({ zone: '' })`)
- Toque fuera del sheet → cierra sin cambiar selección

### Estado local en `MediaStep`

```ts
const [showZoneSheet, setShowZoneSheet] = useState(false)
```

### Estilos del trigger

Sin selección:
```
background: #FFFFFF, border: 1.5px solid #EDE8DE, color: #555
```

Con selección:
```
background: rgba(232,104,58,.08), border: 1.5px solid #E8683A, color: #E8683A
```

### Posición en el return de MediaStep

Entre `{showText && (...)}` y el botón "Analizar con IA", reemplazando el bloque actual de chips de zona.

---

## Parte 3: Pasar `zone` al navigate en `TicketFlow`

En `handlePedir`, el state enviado a `/ticket/confirmar` ya incluye `ticket`, `proId`, etc. Agregar `zone: input.zone`.

```ts
navigate('/ticket/confirmar', {
  state: { ticket: t, proId: pro.id, proName: ..., proAvatar: ..., proRating: ..., zone: input.zone },
})
```

---

## Parte 4: `TicketConfirm` — recibir zone y persistir en la solicitud

### `LocationState`

Agregar `zone: string` a la interfaz:

```ts
interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
  zone: string
}
```

### `handleSubmit`

Pasar `location: zone` en `addRequest`:

```ts
await addRequest({
  professional_id: proId,
  category: ticket.category,
  description: ticket.description,
  urgency: ticket.urgent,
  contact_phone: phone,
  work_type: ticket.work_type,
  location: state.zone || undefined,
})
```

---

## Parte 5: `SolicitudDetail` — mostrar barrio

En la tarjeta de descripción, debajo del texto de descripción y antes de los chips de tipo/urgencia, agregar:

```tsx
{req.location && (
  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
    style={{ background: '#F5F0E8', color: '#666' }}>
    📍 {req.location}
  </span>
)}
```

El chip de barrio se mezcla visualmente con los de tipo de trabajo y urgencia (mismo estilo).

---

## Fuera de scope

- Campo de búsqueda dentro del bottom sheet
- Detectar barrio automáticamente por GPS
- Validar que el barrio ingresado exista en la lista
- Sistema de radio del profesional (Sub-proyecto B)
