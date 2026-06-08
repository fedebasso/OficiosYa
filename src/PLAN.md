# OficioYa — Plan de Desarrollo POC (PWA)

> **Objetivo:** Construir una Proof of Concept funcional como Progressive Web App (PWA) que valide el flujo central de OficioYa: un cliente busca un profesional verificado en Montevideo, solicita un servicio y recibe respuesta.

---

## 1. Alcance del POC

### ¿Qué valida esta POC?
- El flujo cliente → búsqueda → solicitud → respuesta de profesional funciona en mobile
- Los profesionales pueden registrarse y recibir solicitudes
- El sistema de perfiles con verificación básica genera confianza
- La experiencia PWA (instalable, offline-ready) es viable sin app nativa

### ¿Qué NO incluye la POC?
- Pagos intermediados (fase 2 del producto)
- Geolocalización en tiempo real
- Integración real de WhatsApp (se simula con link `wa.me`)
- Verificación de identidad automática (flujo manual)
- Suscripción premium

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | **React 18 + Vite** | Rápido de configurar, ecosistema maduro |
| PWA | **vite-plugin-pwa** | Genera service worker y manifest automáticamente |
| Estilos | **Tailwind CSS** | Desarrollo mobile-first ágil, sin overhead de CSS |
| Routing | **React Router v6** | SPA con rutas limpias |
| Estado | **Zustand** | Liviano, sin boilerplate de Redux |
| Backend | **Supabase** | BaaS con PostgreSQL, auth y storage gratuitos para POC |
| Auth | **Supabase Auth** | Email/password + magic link, sin configuración de servidor |
| Imágenes | **Supabase Storage** | Fotos de trabajos anteriores |
| Deploy | **Vercel** | Free tier, HTTPS automático, ideal para PWA |

---

## 3. Estructura de Pantallas

### Flujo Cliente
```
/                    → Home (búsqueda por categoría)
/buscar/:categoria   → Listado de profesionales filtrado
/profesional/:id     → Perfil detallado del profesional
/solicitar/:id       → Formulario de solicitud de servicio
/mis-solicitudes     → Historial de solicitudes del cliente
```

### Flujo Profesional
```
/pro/registro        → Onboarding: datos, fotos, categorías
/pro/perfil          → Mi perfil (editar)
/pro/solicitudes     → Solicitudes entrantes (aceptar/rechazar)
/pro/trabajos        → Historial de trabajos completados
```

### Flujo Compartido
```
/login               → Acceso (cliente o profesional)
/registro            → Crear cuenta (elige rol)
```

---

## 4. Modelo de Datos (Supabase / PostgreSQL)

```sql
-- Usuarios (extiende auth.users de Supabase)
profiles (
  id uuid PRIMARY KEY,         -- = auth.users.id
  role TEXT,                   -- 'client' | 'professional'
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT DEFAULT 'Montevideo',
  created_at TIMESTAMPTZ
)

-- Profesionales
professionals (
  id uuid PRIMARY KEY,         -- = profiles.id
  bio TEXT,
  categories TEXT[],           -- ['electricista', 'plomero']
  avg_rating NUMERIC(3,2),
  verified BOOLEAN DEFAULT false,
  whatsapp TEXT,
  zone TEXT                    -- barrio en Montevideo
)

-- Fotos de trabajos anteriores
work_photos (
  id uuid PRIMARY KEY,
  professional_id uuid REFERENCES professionals(id),
  url TEXT,
  caption TEXT,
  uploaded_at TIMESTAMPTZ
)

-- Solicitudes de servicio
requests (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES profiles(id),
  professional_id uuid REFERENCES professionals(id),
  category TEXT,
  description TEXT,
  urgency BOOLEAN DEFAULT false,
  status TEXT,                 -- 'pending' | 'accepted' | 'completed' | 'rejected'
  created_at TIMESTAMPTZ
)

-- Reseñas
reviews (
  id uuid PRIMARY KEY,
  request_id uuid REFERENCES requests(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ
)
```

---

## 5. Componentes Principales

```
src/
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx        # Navegación inferior mobile
│   │   ├── Header.tsx
│   │   └── PageShell.tsx
│   ├── home/
│   │   ├── CategoryGrid.tsx     # Grid de categorías (electricista, plomero, etc.)
│   │   └── SearchBar.tsx
│   ├── professionals/
│   │   ├── ProfessionalCard.tsx # Card en listado
│   │   ├── ProfessionalProfile.tsx
│   │   ├── RatingStars.tsx
│   │   └── WorkPhotoGallery.tsx
│   ├── requests/
│   │   ├── RequestForm.tsx
│   │   ├── RequestCard.tsx
│   │   └── UrgencyBadge.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Avatar.tsx
├── pages/
│   ├── Home.tsx
│   ├── Search.tsx
│   ├── ProfessionalDetail.tsx
│   ├── RequestService.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── pro/
│       ├── Dashboard.tsx
│       ├── Requests.tsx
│       └── Profile.tsx
├── store/
│   ├── authStore.ts
│   └── requestStore.ts
├── lib/
│   └── supabase.ts
└── hooks/
    ├── useProfessionals.ts
    └── useRequests.ts
```

---

## 6. Categorías Iniciales (Fase 1)

| ID | Label | Emoji |
|----|-------|-------|
| `electricista` | Electricista | ⚡ |
| `plomero` | Sanitario / Plomero | 🚿 |
| `aire_acondicionado` | Técnico Aire Acond. | ❄️ |

---

## 7. Configuración PWA

```json
// manifest.webmanifest
{
  "name": "OficioYa",
  "short_name": "OficioYa",
  "description": "Encontrá profesionales de confianza en Montevideo",
  "theme_color": "#0F6E56",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker (estrategia):**
- Cache-first para assets estáticos (JS, CSS, fuentes)
- Network-first para datos de profesionales y solicitudes
- Offline fallback page si no hay conexión

---

## 8. Fases de Desarrollo

### Fase 0 — Setup (día 1)
- [ ] `npm create vite@latest oficioYa -- --template react-ts`
- [ ] Instalar dependencias: `tailwindcss`, `react-router-dom`, `zustand`, `@supabase/supabase-js`, `vite-plugin-pwa`
- [ ] Configurar Supabase: crear proyecto, tablas SQL, RLS básico
- [ ] Configurar Vercel para deploy automático
- [ ] Deploy vacío funcionando en HTTPS

### Fase 1 — Flujo Cliente (días 2–4)
- [ ] Home con CategoryGrid (3 categorías)
- [ ] Listado de profesionales por categoría (datos mock en Supabase)
- [ ] Perfil de profesional: bio, fotos, rating, badge verificado
- [ ] Formulario de solicitud (descripción, urgencia, teléfono de contacto)
- [ ] Confirmación enviada → link WhatsApp al profesional

### Fase 2 — Autenticación y Roles (días 5–6)
- [ ] Registro con selección de rol (cliente / profesional)
- [ ] Login con email
- [ ] Rutas protegidas por rol

### Fase 3 — Flujo Profesional (días 7–9)
- [ ] Onboarding profesional: datos, categorías, zona, WhatsApp
- [ ] Subida de fotos de trabajos anteriores (Supabase Storage)
- [ ] Dashboard: ver solicitudes entrantes
- [ ] Aceptar / rechazar solicitud

### Fase 4 — Reseñas y Pulido (días 10–12)
- [ ] Dejar reseña post-servicio (cliente → profesional)
- [ ] Promedio de rating visible en perfil y card
- [ ] Badge "Verificado" (toggle manual desde admin)
- [ ] PWA: instalar prompt, offline page
- [ ] Ajustes de UX mobile: tap targets, loading states

### Fase 5 — Demo y Validación (días 13–14)
- [ ] Cargar 5–10 profesionales reales piloto en Montevideo
- [ ] Test con usuarios reales (5 clientes, 5 profesionales)
- [ ] Métricas a observar: tasa de solicitudes enviadas, tasa de respuesta, abandono en formulario

---

## 9. Criterios de Éxito del POC

| Métrica | Objetivo mínimo |
|---------|----------------|
| Solicitudes enviadas en 2 semanas | ≥ 20 |
| Profesionales activos | ≥ 5 |
| Tasa de respuesta del profesional | ≥ 60% |
| Instalación como PWA | ≥ 3 usuarios |
| NPS del flujo cliente | ≥ 7/10 |

---

## 10. Dependencias npm

```bash
# Core
npm create vite@latest oficioYa -- --template react-ts
npm i react-router-dom zustand @supabase/supabase-js

# Styles
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# PWA
npm i -D vite-plugin-pwa

# Iconos
npm i lucide-react

# Formularios (opcional)
npm i react-hook-form zod @hookform/resolvers
```

---

## 11. Variables de Entorno

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 12. Diseño Visual

**Paleta de colores** (extraída del mockup existente):
- Principal: `#0F6E56` (verde OficioYa)
- Acento: `#9FE1CB` (verde claro)
- Fondo: `#f4f4f2` (gris crema)
- Texto: `#1a1a1a`

**Tipografía:** Inter o similar sans-serif del sistema

**Patrón de UI:** Mobile-first, bottom navigation bar, cards con sombra suave, badges de estado coloreados.

---

## Resumen de Tiempos

| Fase | Duración | Entregable |
|------|----------|-----------|
| 0 — Setup | 1 día | Proyecto en Vercel |
| 1 — Flujo cliente | 3 días | Demo cliente funcional |
| 2 — Auth | 2 días | Login/registro con roles |
| 3 — Flujo profesional | 3 días | Dashboard profesional |
| 4 — Reseñas + PWA | 3 días | App instalable |
| 5 — Validación | 2 días | Métricas iniciales |
| **Total** | **~14 días** | **POC lista para validar** |
