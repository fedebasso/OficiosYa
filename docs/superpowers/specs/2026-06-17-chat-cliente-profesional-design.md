# Chat Cliente–Profesional — Spec de Diseño

**Fecha:** 2026-06-17
**Estado:** Aprobado

---

## Resumen

Chat interno dentro de OficiosYa que conecta al cliente con el profesional asignado a una solicitud. Disponible desde que se crea la solicitud (`pending`) hasta que se completa. Soporta texto, fotos y audios. Implementado primero con mock local; la conexión a Supabase Realtime se agrega en fase posterior.

---

## Cuándo está disponible

El botón "💬 Chat" aparece en `SolicitudDetail` para cualquier solicitud en estado `pending`, `confirmed`, `in_progress` o `completed`. No aparece en solicitudes `cancelled`.

---

## Navegación

```
SolicitudDetail (/solicitudes/:id)
  └── botón "💬 Chat"
        └── Chat (/solicitudes/:id/chat)
```

El chat es una pantalla separada full-screen. El header del chat muestra el nombre y avatar del profesional, la categoría y el número de solicitud. El botón ◀ vuelve al detalle.

---

## Diseño visual

Sigue la paleta de OficiosYa en toda la pantalla:

- **Header:** fondo `#0F6E56`, nombre del pro en blanco, categoría en `#9FE1CB`, badge de estado.
- **Fondo de mensajes:** `#f4f4f2` (crema del sistema).
- **Burbujas propias:** fondo `#0F6E56`, texto blanco, border-radius `12px 4px 12px 12px`.
- **Burbujas del otro:** fondo `#fff`, borde `#e8e0d4`, border-radius `4px 12px 12px 12px`.
- **Barra de entrada:** fondo `#0F6E56`, input transparente con borde blanco (`rgba(255,255,255,0.55)`), íconos cámara y micrófono como SVG blanco en círculo transparente con borde blanco, botón enviar en `#9FE1CB` con ícono `#0F6E56`.

---

## Tipos de mensaje

| Tipo | Descripción |
|------|-------------|
| `text` | Texto plano, multiline |
| `image` | Foto adjunta desde galería o cámara. Se muestra como thumbnail con nombre de archivo. |
| `audio` | Grabación de voz. Se muestra con botón ▶, waveform estática y duración. |
| `system` | Mensaje automático (ej. "Chat habilitado — Juan Pérez asignado"). Centrado, sin burbuja. |

---

## Grabación de audio

- **Iniciar:** tocar el ícono 🎙️.
- **Durante grabación:** la barra de entrada se reemplaza por el estado de grabación: punto rojo parpadeante, waveform animada, contador de tiempo, botón ✕ para cancelar y botón ⏹ para detener y enviar.
- **Al detener:** el audio se agrega como mensaje `audio` al chat.
- **Cancelar:** descarta la grabación, vuelve a la barra normal.

---

## Implementación — Fase 1 (mock local)

Todo el estado del chat vive en `chatStore.ts` (Zustand). Los mensajes son arrays en memoria, inicializados con algunos mensajes mock para que la UI se vea poblada. No hay persistencia entre recargas.

La foto se selecciona con `<input type="file" accept="image/*">` y se convierte a object URL local para mostrarla.

El audio se graba con la Web API `MediaRecorder` y se convierte a Blob URL local.

---

## Componentes a crear

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/pages/Chat.tsx` | Pantalla principal. Orquesta header, lista de mensajes, input. |
| `src/components/chat/ChatBubble.tsx` | Renderiza una burbuja según su tipo (text / image / audio / system). |
| `src/components/chat/ChatInput.tsx` | Barra de entrada: texto, adjuntar foto, abrir grabador, enviar. |
| `src/components/chat/AudioRecorder.tsx` | Estado de grabación: timer, waveform, cancelar, detener. |
| `src/store/chatStore.ts` | Estado Zustand: mensajes por `requestId`, `sendMessage`, `addMockMessages`. |

---

## Cambios en archivos existentes

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/solicitudes/:id/chat` apuntando a `Chat.tsx`. |
| `src/pages/SolicitudDetail.tsx` | Agregar botón "💬 Chat" en la sección de acciones (visible si status ≠ `cancelled`). |

---

## Fase 2 (futura) — Supabase Realtime

- Tabla `messages` en Supabase con columnas: `id`, `request_id`, `sender_id`, `sender_role` (`client`|`pro`), `type`, `content`, `created_at`.
- Para imágenes y audios: Supabase Storage bucket `chat-media`.
- Suscripción Realtime en `chatStore` reemplaza el mock.
- El `chatStore` expone la misma interfaz que en Fase 1 — la UI no cambia.

---

## Criterios de éxito (Fase 1)

- [ ] El botón "💬 Chat" aparece en SolicitudDetail para solicitudes activas.
- [ ] La pantalla de chat muestra mensajes mock al abrir.
- [ ] El usuario puede escribir y enviar texto.
- [ ] El usuario puede adjuntar una foto y se muestra como thumbnail.
- [ ] El usuario puede grabar un audio (tap start → tap stop) y se envía como burbuja.
- [ ] El estado de grabación reemplaza la barra de entrada con waveform y timer.
- [ ] Cancelar grabación vuelve a la barra normal sin enviar nada.
- [ ] Todo sigue la paleta `#0F6E56` / `#9FE1CB` / `#f4f4f2` consistentemente.
