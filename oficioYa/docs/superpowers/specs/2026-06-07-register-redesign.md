# Register Page Redesign

**Date:** 2026-06-07
**Status:** Approved by user

---

## Overview

Rediseño completo de `src/pages/Register.tsx` manteniendo consistencia total con el Login ya rediseñado. El elemento diferenciador es el selector de rol con cards visuales (opción A).

---

## Design — consistente con Login

### Hero section
- Igual al Login: `bg-primary`, logo "Oficio**Ya**" centrado, wave bottom `bg-background rounded-t-[32px]`
- Tagline diferente: **"Creá tu cuenta gratis"** (en lugar de "Profesionales de confianza en Montevideo")

### Form section
- Título: **"Empezá ahora"** — text-xl font-black text-text-main
- Subtítulo: **"Solo te lleva 1 minuto"** — text-sm text-gray-400

### Inputs (mismo estilo que Login)
- **Nombre completo**: ícono 👤, placeholder "Tu nombre"
- **Email**: ícono ✉️, placeholder "tu@email.com"
- **Contraseña**: ícono 🔒, placeholder "Mínimo 6 caracteres", minLength={6}
- Todos: `rounded-2xl border-[1.5px] border-gray-200 py-3.5 pl-11`, focus:border-primary focus:ring-2 focus:ring-primary/10
- Labels: text-xs font-semibold uppercase tracking-wide text-gray-600
- `aria-hidden="true"` en los íconos emoji

### Selector de rol — Cards visuales (opción A)
- Label: "Soy..." (mismo estilo que los otros labels)
- Grid 2 columnas, gap-3
- Cada card: `border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-150`
- Estado **no seleccionado**: `border-gray-200 bg-white`
- Estado **seleccionado**: `border-primary bg-green-50`
- Contenido de cada card:
  - Ícono: 28px (👤 Cliente, 🔧 Profesional)
  - Nombre: text-sm font-black — `text-text-main` / `text-primary` si seleccionado
  - Descripción: text-[10px] text-gray-400 text-center leading-tight
    - Cliente: "Busco profesionales para mi hogar"
    - Profesional: "Ofrezco mis servicios y consigo clientes"
- `active:scale-[.98] transition-all duration-150`
- Default seleccionado: `client`

### Botón
- Idéntico al Login: `bg-primary rounded-2xl py-4 font-bold shadow-[0_4px_14px_rgba(15,110,86,.3)] active:scale-[.99]`
- Texto: "Crear cuenta" / spinner + "Creando cuenta..." cuando loading
- `focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

### Error state
- Idéntico al Login: `bg-red-50 border border-red-200 rounded-2xl`, `role="alert" aria-live="polite"`, `id="register-error"`
- Inputs con `aria-describedby={error ? 'register-error' : undefined}`
- `aria-hidden="true"` en íconos emoji

### Link a login
- "¿Ya tenés cuenta? **Iniciá sesión**" — Link to="/login" text-primary font-bold

---

## Lógica de auth (sin cambios)
- `signUp(email, password, fullName, role)` del authStore
- On success: navega a `/pro/registro` si role === 'professional', a `/` si client
- setError en catch, setLoading durante submit

---

## Archivo a modificar
- `src/pages/Register.tsx`

## Out of scope
- Validación extra de contraseña
- Confirmación de contraseña
- Términos y condiciones
