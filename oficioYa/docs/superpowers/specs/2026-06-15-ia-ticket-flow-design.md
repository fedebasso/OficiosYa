# IA Ticket Flow — Design Spec

## Goal

Transformar OficioYa de un directorio de profesionales a una plataforma inteligente: el usuario describe su problema (foto, audio o texto), la IA genera un ticket estructurado y recomienda los profesionales ideales.

---

## Entry Points

### 1. Card en el Home (nueva)

Ubicada entre la barra de búsqueda y la sección "Más recomendados". Diseño: fondo blanco, borde naranja (`2px solid #E8683A`), ícono ✨ naranja, título "Describí tu problema", subtítulo "La IA encuentra al profesional ideal", flecha derecha. Navega a `/ticket`.

### 2. Botón "Solicitar trabajo" en perfil profesional (reemplaza wizard)

El botón existente en `ProfessionalProfile.tsx` navega a `/ticket?pro={id}`. Con `pro` presente, el paso 4 pre-selecciona ese profesional como primera opción.

---

## Flujo — 5 pasos

### Paso 1: Categoría

**Ruta:** `/ticket` (step 1)

Grid de 2 columnas. Cada card tiene:
- Emoji grande
- Título (ej: "Electricidad")
- Subtítulo descriptivo (ej: "Tomacorrientes, luces, tableros")
- Al seleccionar: fondo naranja `#E8683A`, texto blanco
- Sin seleccionar: fondo `#F5F0E8`, borde `#EDE8DE`

Categorías (6):

| Emoji | Título | Subtítulo |
|-------|--------|-----------|
| ⚡ | Electricidad | Tomacorrientes, luces, tableros |
| 🚿 | Sanitario | Caños, llaves, pérdidas |
| ❄️ | Aire Ac. | Instalación y limpieza |
| 🔑 | Cerrajería | Cerraduras, llaves, portones |
| 🎨 | Pintura | Interior y exterior |
| 🧱 | Albañilería | Reparaciones, muros, pisos |

CTA: botón "Continuar →" deshabilitado hasta seleccionar categoría.

---

### Paso 2: Describí el problema

**Acción principal:** área hero con borde naranja punteado, ícono 📷 centrado, texto "Sacar o subir foto" — abre cámara/galería al tocar.

**Acciones secundarias (3 botones pequeños):**
- 🎤 Audio — graba audio (Web Audio API, mock de transcripción inicialmente)
- 🎥 Video — sube video (mock, no procesa aún)
- ✏️ Texto — expande textarea debajo de los botones

**Estado con foto cargada:** muestra thumbnail de la imagen con botón ✕ para quitar.

**CTA:** "Analizar con IA ✨" — habilitado si hay al menos foto, audio o texto (mín 10 chars).

---

### Paso 3: Procesando (IA mock)

**Visual:**
- Orb circular naranja centrado con efecto glow (dos anillos concéntricos rgba)
- Emoji ✨ dentro del orb
- Título: "Analizando tu problema"
- Subtítulo: "Tardará solo unos segundos"
- 4 pasos de progreso animados secuencialmente (300ms entre cada uno):
  1. "Imagen analizada" → dot naranja relleno con ✓
  2. "Identificando el problema..." → dot con borde naranja (activo)
  3. "Generando ticket" → dot gris (pendiente)
  4. "Buscando profesionales" → dot gris (pendiente)

**Mock:** `ticketService.analyze()` espera 2.5 segundos y devuelve un `GeneratedTicket` hardcodeado basado en la categoría seleccionada. Sin llamada real a OpenAI en MVP.

**Después de completar:** navega automáticamente al paso 4.

---

### Paso 4: Resultados

**Sección superior — Ticket generado:**
- Badge: `✨ Generado por IA` (pill naranja suave, fondo `rgba(232,104,58,.1)`, borde naranja)
- Título grande (18px bold): descripción corta del problema generada por mock
- Descripción (12px): detalle técnico generado
- Tags: 🚨 Urgente (si aplica) + categoría

**Sección inferior — Profesionales recomendados (fondo beige `#F9F6F2`):**
- Label: "Profesionales recomendados"
- Lista ordenada por: disponibilidad 24hs primero, luego rating, luego tiempo de respuesta
- Si `?pro={id}` está en la URL: ese profesional aparece primero
- Cada card tiene: avatar, nombre, ★ rating, trabajos, tiempo de respuesta estimado
- El primero: borde naranja + botón "Pedir" naranja sólido
- Los demás: borde gris + botón "Pedir" outline naranja
- Botón "Pedir" → navega a `/ticket/confirmar?pro={id}`

---

### Paso 5: Confirmación

**Pre-llenado automático** con el ticket generado:
- Muestra resumen del ticket (categoría + descripción corta + urgencia)
- Mini card del profesional elegido (avatar, nombre, rating)
- Input de teléfono de contacto
- Botón "Enviar solicitud" naranja
- Al enviar: llama a `addRequest()` del store con los datos del ticket + profesional elegido + teléfono
- Estado de éxito: misma pantalla de confirmación que el wizard actual (✅ + botón WhatsApp)

---

## Arquitectura

### Tipos (`src/types/ticket.ts`)

```ts
export interface GeneratedTicket {
  title: string           // "Cortocircuito en tomacorriente"
  description: string     // detalle técnico
  category: string        // "electricista"
  urgent: boolean
  work_type: WorkType
}

export interface TicketInput {
  category: string
  photo: File | null
  audioBlob: Blob | null
  text: string
}
```

### Servicio IA (`src/services/ai/ticketService.ts`)

```ts
export async function analyzeTicket(input: TicketInput): Promise<GeneratedTicket>
```

MVP: mock con `setTimeout(2500)` + datos hardcodeados por categoría. La interfaz está lista para conectar OpenAI Vision + Whisper en el futuro sin tocar los componentes.

### Estructura de archivos

```
src/
  types/
    ticket.ts
  services/
    ai/
      ticketService.ts       ← mock inicialmente, OpenAI después
  pages/
    TicketFlow.tsx           ← orquesta los 5 pasos, maneja estado global del flow
    TicketConfirm.tsx        ← paso 5 separado (tiene su propia ruta)
  components/
    ticket/
      TicketEntryCard.tsx    ← card del home
      CategoryStep.tsx       ← paso 1
      MediaStep.tsx          ← paso 2
      AIProcessingStep.tsx   ← paso 3
      ResultsStep.tsx        ← paso 4
```

### Estado del flow (en `TicketFlow.tsx`, local con useState)

```ts
{
  step: 1 | 2 | 3 | 4
  category: string | null
  input: TicketInput
  generatedTicket: GeneratedTicket | null
}
```

### Rutas nuevas en `App.tsx`

```
/ticket              → TicketFlow
/ticket/confirmar    → TicketConfirm (recibe ?pro={id})
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Agregar `<TicketEntryCard />` entre search y profesionales |
| `src/components/professionals/ProfessionalProfile.tsx` | Botón "Solicitar trabajo" navega a `/ticket?pro={id}` |
| `src/App.tsx` | Agregar rutas `/ticket` y `/ticket/confirmar` |

---

## Spec Self-Review

**Placeholders:** ninguno.

**Consistencia:**
- `GeneratedTicket.work_type` usa el tipo `WorkType` ya definido en `requestStore.ts` — consistente.
- El paso 5 (`TicketConfirm`) llama a `addRequest()` del store existente — sin cambios al store.
- `analyzeTicket()` retorna `GeneratedTicket`; `ResultsStep` consume `GeneratedTicket` — tipos consistentes en toda la cadena.

**Scope:** 7 componentes nuevos + 1 servicio + 1 tipos file + 3 archivos modificados. Manejable en un plan de implementación.

**Ambigüedad resuelta:**
- Audio y video en MVP: se capturan (UI funcional) pero el mock devuelve el mismo ticket sin procesar el contenido real.
- Si el usuario viene desde `/ticket?pro={id}`: ese profesional aparece primero en la lista del paso 4, sin saltear los pasos 1-3.
- El `TicketEntryCard` reemplaza funcionalmente al wizard para el flujo desde Home; el wizard antiguo (`RequestWizard`) queda en `/solicitar/:id` como fallback pero el botón del perfil profesional apunta al nuevo flow.
