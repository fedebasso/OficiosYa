# Client Profile Edit — Design Spec

## Objetivo

Permitir al cliente editar su nombre, teléfono y foto de perfil desde la app. Los datos se guardan en localStorage hasta que se conecte Supabase.

---

## Flujo

1. `ClientProfile` muestra botón "Editar perfil" bajo el avatar
2. Al tocarlo → navega a `/perfil/editar`
3. El usuario edita nombre, teléfono y/o foto
4. Al tocar "Guardar" → persiste en localStorage → vuelve a `/perfil`
5. `ClientProfile` lee los datos locales y los muestra actualizados

---

## Pantalla `/perfil/editar`

### Componentes visuales

- Header con botón back y título "Editar perfil"
- Avatar grande (96px) centrado — muestra foto local o initials con gradiente naranja
- Botón cámara superpuesto al avatar para subir foto
- Input "Nombre completo" — pre-llenado con `user.full_name`
- Input "Teléfono" — pre-llenado con dato local o vacío
- Botón "Guardar" naranja — ancho completo

### Archivo nuevo

`src/pages/ClientProfileEdit.tsx`

---

## Persistencia localStorage

```ts
// Foto (base64)
localStorage.setItem(`client_avatar_${userId}`, base64String)
localStorage.getItem(`client_avatar_${userId}`)

// Datos de texto
localStorage.setItem(`client_profile_${userId}`, JSON.stringify({ full_name, phone }))
localStorage.getItem(`client_profile_${userId}`)
```

### Límites

- Foto máx 2MB antes de convertir a base64
- Formatos: jpg/png/webp
- Si la foto supera el límite: mostrar alerta y no guardar

---

## Cambios en ClientProfile

- Leer `client_avatar_<userId>` y `client_profile_<userId>` de localStorage al montar
- Mostrar foto si existe, initials si no
- Agregar botón "Editar perfil" bajo el avatar

---

## Ruta nueva

En `AnimatedRoutes.tsx`, agregar:

```tsx
<Route path="/perfil/editar" element={<ProtectedRoute requiredRole="client"><ClientProfileEdit /></ProtectedRoute>} />
```

---

## Constraints

- No tocar Supabase ni authStore (los datos reales del user no cambian)
- La foto se guarda como base64 en localStorage — limitación conocida, se reemplazará por Supabase Storage
- El nombre mostrado en `ClientProfile` se toma de localStorage si existe, sino del authStore
- Validación: nombre no puede estar vacío al guardar
