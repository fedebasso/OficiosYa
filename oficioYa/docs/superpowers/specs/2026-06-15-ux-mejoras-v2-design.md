# UX Mejoras V2 — Design Spec

## Goal

Simplificar el proceso de solicitud de servicio, limpiar el Home, y mejorar la card de profesionales para que la app sea más fácil de usar para cualquier persona.

---

## 1. Proceso de solicitud — Wizard de 4 pasos

### Contexto
El wizard actual tiene 7 pasos (tipo, descripción, fotos, ubicación, urgencia, tipo solicitud, confirmación). Es demasiado largo y pierde usuarios por el camino.

### Nuevo flujo — 4 pasos

**Paso 1 — Tipo de trabajo**

Cuatro opciones en lista vertical, cada una con ícono grande + título + subtítulo descriptivo:

| Valor | Título | Subtítulo |
|-------|--------|-----------|
| `reparacion` | Reparación | Arreglar algo que se rompió |
| `instalacion` | Instalación | Instalar algo nuevo |
| `mantenimiento` | Mantenimiento | Revisión o mantenimiento |
| `otro` | Otro | Cualquier otro trabajo |

La opción seleccionada se marca con borde naranja + fondo naranja suave + ✓. El botón "Siguiente" se habilita al seleccionar una opción.

**Paso 2 — Descripción del trabajo**

Textarea libre con placeholder contextual. Contador de caracteres mínimos (20 chars). El botón "Siguiente" se habilita al superar el mínimo.

**Paso 3 — ¿Es urgente?**

Un único toggle con diseño prominente:
- Fondo rojo suave (`#fff5f5`), borde rojo (`#ef4444`), ícono 🚨
- Título: "Es urgente" · Subtítulo: "Necesito ayuda lo antes posible"
- Toggle switch a la derecha (rojo cuando activo)
- **Sin texto explicativo** cuando está inactivo — el estado por defecto es pedido normal
- Por defecto: desactivado (pedido normal)

**Paso 4 — Confirmación**

- Tabla resumen con las elecciones de pasos 1, 2 y 3
- Campo de teléfono de contacto (requerido, mín 8 chars)
- Botón "Enviar solicitud" (naranja, ancho completo)
- Botón "Atrás" para corregir

### Eliminados del wizard
- ~~Paso 3 — Fotos~~ (reducción de fricción)
- ~~Paso 4 — Ubicación~~ (reducción de fricción)
- ~~Paso 6 — Tipo de solicitud (presupuesto/visita)~~ (reducción de fricción)

### Barra de progreso
Sigue siendo naranja, ahora muestra 4 segmentos en lugar de 7.

### Archivo afectado
- `src/components/requests/RequestWizard.tsx` — reescritura completa del componente

---

## 2. Home — Eliminar CategoryChips

### Qué cambia
Eliminar `<CategoryChips />` del header del Home y su import.

El header queda con dos filas:
1. Logo + ubicación
2. Barra de búsqueda

### Archivo afectado
- `src/pages/Home.tsx`

---

## 3. ProfessionalCard — Tres cambios

### 3a. Eliminar badge "Verificado"

Quitar el span `✓ Verificado` de la card. El dato `verified` se sigue usando en el perfil completo (`ProfessionalProfile.tsx`) — no se toca.

### 3b. Botón de favorito rediseñado

**Antes:** círculo pequeño (28×28), con `Heart` de lucide-react.

**Después:** cuadrado redondeado (32×32, `border-radius: 10px`).

| Estado | Background | Border | Ícono |
|--------|-----------|--------|-------|
| Sin guardar | `#F5F0E8` | `1.5px solid #E8E0D4` | ♡ gris claro (`#CCCCCC`) |
| Guardado | `#FEF2F2` | `1.5px solid #FECACA` | ❤️ rojo (`#EF4444`) fill completo |

El tap target visual es 32×32 pero se puede agregar padding invisible para mayor área táctil. Animación `active:scale-90` se mantiene.

### 3c. Nueva disposición de información

**Antes:**
```
Nombre
⚡ Electricista          (color accent, medium)
📍 Pocitos  🔨 127 trabajos  (gris, pequeño)
```

**Después:**
```
Nombre
[⚡ Electricista]        (chip naranja, font-size xs)
📍 Pocitos | 127 trabajos  (fila: zona normal · número destacado)
```

Especificaciones:
- **Profesión**: chip con `background: rgba(232,104,58,.12)`, `color: #E8683A`, `font-size: var(--text-xs)`, `font-weight: 700`, `padding: 2px 8px`, `border-radius: 6px`
- **Zona**: `font-size: var(--text-sm)`, `font-weight: 600`, `color: #888`
- **Separador**: `|` en `#DDD`
- **Número de trabajos**: `font-size: var(--text-sm)`, `font-weight: 800`, `color: #333` + texto " trabajos" en `font-weight: 500`, `color: #888`

### Archivo afectado
- `src/components/professionals/ProfessionalCard.tsx`

---

## Archivos que NO cambian

- `src/components/professionals/ProfessionalProfile.tsx` — el perfil mantiene verificado, header y badges actuales
- `src/store/requestStore.ts` — los tipos `WorkType`, `UrgencyLevel`, `RequestType` se mantienen, solo se eliminan los campos `request_type` y `location` del payload enviado (pasos eliminados del wizard)
- `src/pages/RequestService.tsx` — solo se actualiza el `handleSubmit` para omitir los campos de los pasos eliminados
- `src/components/home/CategoryIcons.tsx` — no se toca

---

## Spec Self-Review

**Placeholders:** ninguno.

**Consistencia interna:** el store mantiene campos opcionales (`request_type`, `location`, `urgency_level`) que el nuevo wizard no llena — esto es correcto porque son opcionales en el tipo. El `urgency` booleano se deriva del toggle: `true` si activado, `false` si no.

**Scope:** tres archivos principales + un archivo de página. Apropiado para un plan de implementación.

**Ambigüedad resuelta:**
- "Pedido normal" = toggle de urgencia desactivado = `urgency: false`
- El tipo `request_type` ya no se captura en el wizard pero el campo sigue siendo opcional en el store (no rompe nada)
- CategoryChips se elimina del Home pero el componente `CategoryChips.tsx` no se borra (puede usarse en Search u otras páginas en el futuro)
