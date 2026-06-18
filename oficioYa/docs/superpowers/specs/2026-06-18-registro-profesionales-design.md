# Sistema de Registro y Verificación de Profesionales — OficiosYa

**Fecha:** 2026-06-18  
**Estado:** Aprobado  
**Stack:** React + Vite + TypeScript + Supabase + Tailwind CSS

---

## Objetivo

Crear un proceso de registro profesional completo de 10 pasos con guardado progresivo, verificación de identidad manual (con estructura preparada para IA futura), score de completitud ponderado, y perfil público controlado.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Verificación de identidad | Simulada — aprobación manual por admin, estructura preparada para IA |
| Storage de archivos | Supabase Storage |
| Flujo del wizard | Guardado progresivo por paso (no al final) |
| Wizard existente | Reemplazar `ProOnboarding.tsx` completamente |
| Score | % completitud ponderado por campo |

---

## Base de datos

### Tabla `professionals` (ampliar existente)

```sql
-- Control de registro
registration_step        int DEFAULT 1        -- paso actual (1-10)
registration_completed   boolean DEFAULT false
verification_status      text DEFAULT 'pending' -- 'pending' | 'verified' | 'rejected'
quality_score            int DEFAULT 0         -- 0-100

-- Paso 1 - Datos personales
cedula                   text
birth_date               date
address                  text
department               text
city                     text

-- Paso 2 - Info profesional
trade                    text                  -- oficio principal
specialties              text[]

-- Paso 3 - Experiencia
years_experience         int
work_mode                text                  -- 'independiente' | 'empresa'
bio                      text                  -- máx 500 chars

-- Paso 6 - Zona
coverage_departments     text[]
coverage_radius_km       int                   -- null = todo el departamento
travels_anywhere         boolean DEFAULT false

-- Paso 7 - Disponibilidad
availability_days        text[]
availability_from        time
availability_to          time
emergency_24h            boolean DEFAULT false

-- Paso 8 - Contacto (oculto en perfil público)
whatsapp                 text
contact_email            text
```

### Tabla `work_portfolio` (nueva)

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
professional_id   uuid REFERENCES professionals(id)
title             text NOT NULL
description       text
work_date         date
category          text
photo_urls        text[]
created_at        timestamptz DEFAULT now()
```

### Tabla `certifications` (nueva)

```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
professional_id       uuid REFERENCES professionals(id)
type                  text   -- 'titulo' | 'certificado' | 'curso' | 'carnet'
title                 text
institution           text
issue_date            date
file_url              text
ai_extracted_data     jsonb  -- preparado para extracción IA futura
verified              boolean DEFAULT false
created_at            timestamptz DEFAULT now()
```

### Tabla `identity_verification` (nueva)

```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
professional_id   uuid REFERENCES professionals(id) UNIQUE
cedula_front_url  text
cedula_back_url   text
selfie_url        text
status            text DEFAULT 'pending'  -- 'pending' | 'verified' | 'rejected'
admin_notes       text
reviewed_at       timestamptz
reviewed_by       uuid REFERENCES profiles(id)
created_at        timestamptz DEFAULT now()
```

---

## Storage — Supabase Buckets

| Bucket | Acceso | Uso |
|---|---|---|
| `pro-avatars` | público lectura, write solo dueño | foto de perfil |
| `pro-portfolio` | público lectura, write solo dueño | fotos de trabajos |
| `pro-certifications` | público lectura, write solo dueño | PDFs y diplomas |
| `pro-identity` | solo dueño + admin | fotos de cédula y selfie |

---

## Arquitectura Frontend

### Ruta principal

`/pro/registro` → `src/pages/pro/ProRegistration.tsx`  
Reemplaza `ProOnboarding.tsx`.

### Estructura de archivos

```
src/pages/pro/
  ProRegistration.tsx                    ← shell del wizard

src/components/pro/registration/
  RegistrationShell.tsx                  ← barra de progreso + nav siguiente/atrás
  Step1PersonalData.tsx
  Step2TradeInfo.tsx
  Step3Experience.tsx
  Step4Portfolio.tsx
  Step5Certifications.tsx
  Step6WorkZone.tsx
  Step7Availability.tsx
  Step8ContactInfo.tsx
  Step9Identity.tsx
  Step10Summary.tsx

src/services/
  registrationService.ts                 ← saveStep(), calcScore(), submitForReview()

src/hooks/
  useRegistration.ts                     ← carga estado, expone saveStep()
```

### Flujo de datos

1. Al entrar a `/pro/registro`, `useRegistration` carga `registration_step` actual desde Supabase.
2. Cada step recibe `onNext(data)` — llama `registrationService.saveStep(step, data)`.
3. `saveStep` persiste en Supabase, recalcula score, avanza `registration_step`.
4. Al completar paso 10: `registration_completed = true`, `verification_status = 'pending'`.

---

## Bloqueos por etapas

| Pasos | Obligatoriedad |
|---|---|
| 1-3 | Obligatorios para activar cuenta profesional. Sin estos no aparece en marketplace. |
| 4-9 | Opcionales, mejoran score. El pro puede guardar y volver. |
| 10 (envío) | Requiere paso 4 (mín 5 fotos) y paso 9 (fotos de cédula + selfie) completos. |

---

## Sistema de Score (% completitud ponderado)

| Paso | Factor | Puntos |
|---|---|---|
| 1 | Datos personales completos (todos los campos) | 15 |
| 2 | Oficio + al menos 1 especialidad | 10 |
| 3 | Experiencia + bio (mín 50 chars) | 10 |
| 4 | Portfolio con mínimo 5 fotos | 20 |
| 5 | Al menos 1 certificación subida | 10 |
| 6 | Zona de trabajo definida | 5 |
| 7 | Disponibilidad configurada | 5 |
| 8 | WhatsApp o teléfono de contacto | 5 |
| 9 | Fotos de cédula + selfie subidas | 20 |
| **Total** | | **100** |

Valoraciones futuras se integrarán como multiplicador sobre este score base.

---

## Estados del profesional

| Estado | Condición | Visible en marketplace |
|---|---|---|
| `sin_registro` | Cuenta creada, wizard no iniciado | No |
| `en_progreso` | `registration_step` 1-9, `completed = false` | No |
| `pendiente` | `completed = true`, `verification_status = 'pending'` | No |
| `verificado` | `verification_status = 'verified'` | Sí |
| `rechazado` | `verification_status = 'rejected'` | No (puede corregir y reenviar) |

---

## Perfil Público (`/pro/:id`)

### Visible
- Foto de perfil, nombre, oficio
- Especialidades, años de experiencia
- Zona de cobertura
- Fotos del portfolio
- Certificaciones verificadas
- Score (barra visual)
- Badge ✓ Profesional Verificado
- Cantidad de trabajos realizados + calificación promedio

### Oculto siempre
- Teléfono, WhatsApp, email de contacto
- Dirección exacta, cédula

El WhatsApp/teléfono se revela únicamente luego de que el cliente envía una solicitud (flujo existente en `requestService.ts`).

---

## Panel Admin

Nueva ruta `/admin/verificaciones` con:
- Lista de profesionales en estado `pending`
- Vista de fotos de cédula (frente/dorso) + selfie
- Botones Aprobar / Rechazar + campo de notas
- Al aprobar: `verification_status = 'verified'`, score recalculado con +20 pts del paso 9

---

## Categorías de oficios

Electricista · Sanitario · Albañil · Pintor · Herrero · Carpintero · Técnico en AC · Cerrajero · Jardinero · Limpieza · Mudanzas · Manitas · Otros

---

## Validaciones

| Campo | Regla |
|---|---|
| Teléfono | Único en `profiles` |
| Email | Único en `auth.users` (Supabase) |
| Foto de perfil | Obligatoria en paso 1 |
| Portfolio | Mínimo 5 fotos para completar paso 4 |
| Bio | Máximo 500 caracteres |
| Cédula | Formato uruguayo (7-8 dígitos numéricos) |
| Fotos portfolio | Máximo 30 fotos por profesional |

---

## Preparación para IA futura

- `certifications.ai_extracted_data` (jsonb) — reservado para extracción automática de nombre, institución y fecha.
- `identity_verification` — estructura lista para conectar comparación facial (selfie vs cédula).
- `quality_score` — diseñado como base para ranking semántico y recomendación inteligente.
- Todos los campos de especialidades, zona, disponibilidad y experiencia están estructurados para búsqueda semántica futura.
