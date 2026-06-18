# Registro y Verificación de Profesionales — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar un wizard de 10 pasos con guardado progresivo para el registro completo de profesionales, verificación de identidad manual, score de completitud y panel admin.

**Architecture:** Wizard con guardado por paso en Supabase (no al final). Cada paso llama a `registrationService.saveStep()` que persiste y recalcula el score. El shell `ProRegistration.tsx` reemplaza `ProOnboarding.tsx` y renderiza el step activo según `registration_step` de la DB.

**Tech Stack:** React 19 + TypeScript + Vite, Tailwind CSS v3, React Router v7, Zustand, Supabase (DB + Storage), sin framework de tests (verificación manual con `npm run dev`).

## Global Constraints

- Colores portal profesional: fondo `#F5F0E8`, acento `#E8683A`, texto `#111111`, secundario `#555555`
- Colores insignia verificado: `#0F6E56` (verde primario del marketplace)
- Todos los textos en español rioplatense (vos, no tú)
- Teléfonos y WhatsApp en formato uruguayo
- `IS_DEMO_MODE` de `src/lib/env.ts` — respetar en todos los servicios
- No mostrar teléfono/WhatsApp/email en perfil público
- Score = % completitud ponderado (0-100), no hay IA en esta fase
- Verificación de identidad: manual por admin (estado pendiente → verificado/rechazado)

---

## File Map

| Acción | Archivo |
|---|---|
| Crear | `src/types/registration.ts` |
| Modificar | `src/lib/categories.ts` |
| Crear | `src/services/registrationService.ts` |
| Crear | `src/hooks/useRegistration.ts` |
| Crear | `src/components/pro/registration/RegistrationShell.tsx` |
| Crear | `src/components/pro/registration/Step1PersonalData.tsx` |
| Crear | `src/components/pro/registration/Step2TradeInfo.tsx` |
| Crear | `src/components/pro/registration/Step3Experience.tsx` |
| Crear | `src/components/pro/registration/Step4Portfolio.tsx` |
| Crear | `src/components/pro/registration/Step5Certifications.tsx` |
| Crear | `src/components/pro/registration/Step6WorkZone.tsx` |
| Crear | `src/components/pro/registration/Step7Availability.tsx` |
| Crear | `src/components/pro/registration/Step8ContactInfo.tsx` |
| Crear | `src/components/pro/registration/Step9Identity.tsx` |
| Crear | `src/components/pro/registration/Step10Summary.tsx` |
| Crear | `src/pages/pro/ProRegistration.tsx` |
| Crear | `src/pages/admin/AdminVerificaciones.tsx` |
| Modificar | `src/pages/ProfessionalDetail.tsx` |
| Modificar | `src/App.tsx` |

---

## Task 1: Migraciones de base de datos y storage buckets

**Files:**
- Crear: `supabase/migrations/20260618_registro_profesionales.sql`

**Interfaces:**
- Produce: tablas `work_portfolio`, `certifications`, `identity_verification`; columnas nuevas en `professionals`; 4 buckets en Storage

- [ ] **Step 1: Crear archivo de migración SQL**

Crear el archivo `supabase/migrations/20260618_registro_profesionales.sql` con el siguiente contenido:

```sql
-- Ampliar tabla professionals con campos de registro
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS registration_step      int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS registration_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status    text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS quality_score          int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cedula                 text,
  ADD COLUMN IF NOT EXISTS birth_date             date,
  ADD COLUMN IF NOT EXISTS address                text,
  ADD COLUMN IF NOT EXISTS department             text,
  ADD COLUMN IF NOT EXISTS city                   text,
  ADD COLUMN IF NOT EXISTS trade                  text,
  ADD COLUMN IF NOT EXISTS specialties            text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience       int,
  ADD COLUMN IF NOT EXISTS work_mode              text,
  ADD COLUMN IF NOT EXISTS coverage_departments   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coverage_radius_km     int,
  ADD COLUMN IF NOT EXISTS travels_anywhere       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_days      text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability_from      time,
  ADD COLUMN IF NOT EXISTS availability_to        time,
  ADD COLUMN IF NOT EXISTS emergency_24h          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp               text,
  ADD COLUMN IF NOT EXISTS contact_email          text;

-- Tabla portfolio de trabajos
CREATE TABLE IF NOT EXISTS work_portfolio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  work_date       date,
  category        text,
  photo_urls      text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

-- Tabla certificaciones
CREATE TABLE IF NOT EXISTS certifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id     uuid REFERENCES professionals(id) ON DELETE CASCADE,
  type                text NOT NULL,  -- 'titulo' | 'certificado' | 'curso' | 'carnet'
  title               text,
  institution         text,
  issue_date          date,
  file_url            text,
  ai_extracted_data   jsonb,
  verified            boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- Tabla verificación de identidad
CREATE TABLE IF NOT EXISTS identity_verification (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   uuid REFERENCES professionals(id) ON DELETE CASCADE UNIQUE,
  cedula_front_url  text,
  cedula_back_url   text,
  selfie_url        text,
  status            text DEFAULT 'pending',  -- 'pending' | 'verified' | 'rejected'
  admin_notes       text,
  reviewed_at       timestamptz,
  reviewed_by       uuid,
  created_at        timestamptz DEFAULT now()
);

-- RLS: work_portfolio
ALTER TABLE work_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own portfolio" ON work_portfolio
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Public can read portfolio" ON work_portfolio
  FOR SELECT USING (true);

-- RLS: certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own certifications" ON certifications
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Public can read certifications" ON certifications
  FOR SELECT USING (true);

-- RLS: identity_verification (solo dueño y admin)
ALTER TABLE identity_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own identity" ON identity_verification
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
```

- [ ] **Step 2: Ejecutar la migración en Supabase**

En el dashboard de Supabase → SQL Editor, pegar y ejecutar el contenido del archivo.

Verificar que se crearon las 3 tablas nuevas y las columnas en `professionals`.

- [ ] **Step 3: Crear los 4 Storage buckets**

En Supabase → Storage → New Bucket, crear:

| Bucket | Public |
|---|---|
| `pro-avatars` | ✅ sí |
| `pro-portfolio` | ✅ sí |
| `pro-certifications` | ✅ sí |
| `pro-identity` | ❌ no (privado) |

Para cada bucket público, en Policies → New Policy → "Give users access to own folder" seleccionar INSERT + UPDATE para `authenticated`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260618_registro_profesionales.sql
git commit -m "feat: DB migration registro profesionales + storage buckets"
```

---

## Task 2: Tipos TypeScript y categorías expandidas

**Files:**
- Crear: `src/types/registration.ts`
- Modificar: `src/lib/categories.ts`

**Interfaces:**
- Produce: `RegistrationState`, `PortfolioItem`, `CertificationItem`, `IdentityVerification` — usados por Tasks 3, 4 y todos los steps

- [ ] **Step 1: Crear `src/types/registration.ts`**

```typescript
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type WorkMode = 'independiente' | 'empresa'
export type CertType = 'titulo' | 'certificado' | 'curso' | 'carnet'

export interface RegistrationState {
  registration_step: number
  registration_completed: boolean
  verification_status: VerificationStatus
  quality_score: number
  // Paso 1
  cedula: string | null
  birth_date: string | null
  address: string | null
  department: string | null
  city: string | null
  // Paso 2
  trade: string | null
  specialties: string[]
  // Paso 3
  years_experience: number | null
  work_mode: WorkMode | null
  bio: string | null
  // Paso 6
  coverage_departments: string[]
  coverage_radius_km: number | null
  travels_anywhere: boolean
  // Paso 7
  availability_days: string[]
  availability_from: string | null
  availability_to: string | null
  emergency_24h: boolean
  // Paso 8
  whatsapp: string | null
  contact_email: string | null
}

export interface PortfolioItem {
  id: string
  professional_id: string
  title: string
  description: string | null
  work_date: string | null
  category: string | null
  photo_urls: string[]
  created_at: string
}

export interface CertificationItem {
  id: string
  professional_id: string
  type: CertType
  title: string | null
  institution: string | null
  issue_date: string | null
  file_url: string | null
  ai_extracted_data: Record<string, unknown> | null
  verified: boolean
  created_at: string
}

export interface IdentityVerification {
  id: string
  professional_id: string
  cedula_front_url: string | null
  cedula_back_url: string | null
  selfie_url: string | null
  status: VerificationStatus
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
}

export const SCORE_WEIGHTS = {
  step1: 15,  // datos personales
  step2: 10,  // oficio + especialidades
  step3: 10,  // experiencia + bio
  step4: 20,  // portfolio mín 5 fotos
  step5: 10,  // al menos 1 certificación
  step6: 5,   // zona
  step7: 5,   // disponibilidad
  step8: 5,   // contacto
  step9: 20,  // verificación identidad
} as const
```

- [ ] **Step 2: Expandir `src/lib/categories.ts`**

Agregar al final del archivo (no reemplazar lo existente, agregar):

```typescript
// Categorías completas para registro de profesionales
export const ALL_TRADES: { value: string; label: string; emoji: string }[] = [
  { value: 'electricista',        label: 'Electricista',           emoji: '⚡' },
  { value: 'plomero',             label: 'Sanitario',              emoji: '🚿' },
  { value: 'albanil',             label: 'Albañil',                emoji: '🧱' },
  { value: 'pintor',              label: 'Pintor',                 emoji: '🎨' },
  { value: 'herrero',             label: 'Herrero',                emoji: '⚙️' },
  { value: 'carpintero',          label: 'Carpintero',             emoji: '🪚' },
  { value: 'aire_acondicionado',  label: 'Técnico en AC',          emoji: '❄️' },
  { value: 'cerrajero',           label: 'Cerrajero',              emoji: '🔑' },
  { value: 'jardinero',           label: 'Jardinero',              emoji: '🌿' },
  { value: 'limpieza',            label: 'Limpieza',               emoji: '🧹' },
  { value: 'mudanzas',            label: 'Mudanzas',               emoji: '📦' },
  { value: 'manitas',             label: 'Manitas',                emoji: '🔧' },
  { value: 'otros',               label: 'Otros',                  emoji: '🛠️' },
]

export const SPECIALTIES_BY_TRADE: Record<string, string[]> = {
  electricista:       ['Instalaciones nuevas', 'Reparaciones', 'Automatización', 'Domótica'],
  plomero:            ['Destapes', 'Instalaciones', 'Reparaciones', 'Termotanques'],
  albanil:            ['Construcción', 'Reformas', 'Revoques', 'Impermeabilización'],
  pintor:             ['Interior', 'Exterior', 'Texturas', 'Papel mural'],
  herrero:            ['Rejas', 'Portones', 'Soldadura', 'Estructuras'],
  carpintero:         ['Muebles', 'Puertas', 'Aberturas', 'Deck'],
  aire_acondicionado: ['Instalación', 'Mantenimiento', 'Reparación', 'Gas'],
  cerrajero:          ['Apertura', 'Cambio de cerradura', 'Caja fuerte', 'Alarmas'],
  jardinero:          ['Diseño', 'Mantenimiento', 'Poda', 'Riego automático'],
  limpieza:           ['Hogar', 'Oficinas', 'Post obra', 'Vidrios'],
  mudanzas:           ['Local', 'Larga distancia', 'Embalaje', 'Piano/objetos especiales'],
  manitas:            ['Reparaciones generales', 'Montaje de muebles', 'Colgado de cuadros'],
  otros:              [],
}

export const DEPARTMENTS_UY = [
  'Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'San José',
  'Flores', 'Florida', 'Soriano', 'Río Negro', 'Paysandú',
  'Salto', 'Artigas', 'Rivera', 'Tacuarembó', 'Cerro Largo',
  'Treinta y Tres', 'Rocha', 'Lavalleja', 'Durazno', 'Minas',
]
```

- [ ] **Step 3: Verificar que el build no tiene errores**

```bash
npm run build
```

Expected: sin errores TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/types/registration.ts src/lib/categories.ts
git commit -m "feat: tipos de registro y categorías expandidas"
```

---

## Task 3: `registrationService.ts`

**Files:**
- Crear: `src/services/registrationService.ts`

**Interfaces:**
- Consume: `RegistrationState`, `PortfolioItem`, `CertificationItem`, `IdentityVerification` de `src/types/registration.ts`; `supabase` de `src/lib/supabase.ts`; `SCORE_WEIGHTS` de `src/types/registration.ts`
- Produce:
  - `registrationService.load(proId: string): Promise<RegistrationState | null>`
  - `registrationService.saveStep(proId: string, step: number, data: Partial<RegistrationState>): Promise<{ quality_score: number }>`
  - `registrationService.submitForReview(proId: string): Promise<void>`
  - `registrationService.uploadFile(bucket: string, proId: string, file: File): Promise<string>`
  - `registrationService.getPortfolio(proId: string): Promise<PortfolioItem[]>`
  - `registrationService.addPortfolioItem(proId: string, item: Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>): Promise<PortfolioItem>`
  - `registrationService.deletePortfolioItem(id: string): Promise<void>`
  - `registrationService.getCertifications(proId: string): Promise<CertificationItem[]>`
  - `registrationService.addCertification(proId: string, item: Omit<CertificationItem, 'id' | 'professional_id' | 'created_at' | 'verified' | 'ai_extracted_data'>): Promise<CertificationItem>`
  - `registrationService.getIdentity(proId: string): Promise<IdentityVerification | null>`
  - `registrationService.saveIdentity(proId: string, data: Partial<IdentityVerification>): Promise<void>`

- [ ] **Step 1: Crear `src/services/registrationService.ts`**

```typescript
import { supabase } from '../lib/supabase'
import type {
  RegistrationState,
  PortfolioItem,
  CertificationItem,
  IdentityVerification,
  SCORE_WEIGHTS,
} from '../types/registration'
import { SCORE_WEIGHTS as SW } from '../types/registration'

function calcScore(state: Partial<RegistrationState>, portfolioCount: number, certCount: number, identityDone: boolean): number {
  let score = 0

  // Paso 1: todos los campos personales presentes
  if (state.cedula && state.birth_date && state.address && state.department && state.city)
    score += SW.step1

  // Paso 2: oficio + al menos 1 especialidad
  if (state.trade && state.specialties && state.specialties.length > 0)
    score += SW.step2

  // Paso 3: experiencia + bio mín 50 chars
  if (state.years_experience != null && state.work_mode && state.bio && state.bio.length >= 50)
    score += SW.step3

  // Paso 4: mínimo 5 fotos de trabajos
  if (portfolioCount >= 5)
    score += SW.step4

  // Paso 5: al menos 1 certificación
  if (certCount >= 1)
    score += SW.step5

  // Paso 6: al menos 1 departamento o travels_anywhere
  if ((state.coverage_departments && state.coverage_departments.length > 0) || state.travels_anywhere)
    score += SW.step6

  // Paso 7: días configurados
  if (state.availability_days && state.availability_days.length > 0 && state.availability_from && state.availability_to)
    score += SW.step7

  // Paso 8: whatsapp o teléfono
  if (state.whatsapp || state.contact_email)
    score += SW.step8

  // Paso 9: fotos de cédula + selfie subidas
  if (identityDone)
    score += SW.step9

  return score
}

export const registrationService = {
  async load(proId: string): Promise<RegistrationState | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', proId)
      .single()
    if (error || !data) return null
    return data as RegistrationState
  },

  async saveStep(proId: string, step: number, data: Partial<RegistrationState>): Promise<{ quality_score: number }> {
    // Calcular score actualizado
    const current = await this.load(proId)
    const merged = { ...current, ...data }

    const [portfolioRes, certRes, identityRes] = await Promise.all([
      supabase.from('work_portfolio').select('id').eq('professional_id', proId),
      supabase.from('certifications').select('id').eq('professional_id', proId),
      supabase.from('identity_verification').select('cedula_front_url,cedula_back_url,selfie_url').eq('professional_id', proId).single(),
    ])

    const portfolioCount = portfolioRes.data?.length ?? 0
    const certCount = certRes.data?.length ?? 0
    const identity = identityRes.data
    const identityDone = !!(identity?.cedula_front_url && identity?.cedula_back_url && identity?.selfie_url)

    const quality_score = calcScore(merged, portfolioCount, certCount, identityDone)
    const nextStep = Math.max((current?.registration_step ?? 1), step + 1)

    await supabase
      .from('professionals')
      .update({ ...data, quality_score, registration_step: nextStep })
      .eq('id', proId)

    return { quality_score }
  },

  async submitForReview(proId: string): Promise<void> {
    await supabase
      .from('professionals')
      .update({ registration_completed: true, verification_status: 'pending' })
      .eq('id', proId)
  },

  async uploadFile(bucket: string, proId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${proId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  async getPortfolio(proId: string): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from('work_portfolio')
      .select('*')
      .eq('professional_id', proId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as PortfolioItem[]) ?? []
  },

  async addPortfolioItem(
    proId: string,
    item: Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>
  ): Promise<PortfolioItem> {
    const { data, error } = await supabase
      .from('work_portfolio')
      .insert({ ...item, professional_id: proId })
      .select()
      .single()
    if (error) throw error
    return data as PortfolioItem
  },

  async deletePortfolioItem(id: string): Promise<void> {
    const { error } = await supabase.from('work_portfolio').delete().eq('id', id)
    if (error) throw error
  },

  async getCertifications(proId: string): Promise<CertificationItem[]> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('professional_id', proId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as CertificationItem[]) ?? []
  },

  async addCertification(
    proId: string,
    item: Omit<CertificationItem, 'id' | 'professional_id' | 'created_at' | 'verified' | 'ai_extracted_data'>
  ): Promise<CertificationItem> {
    const { data, error } = await supabase
      .from('certifications')
      .insert({ ...item, professional_id: proId, verified: false, ai_extracted_data: null })
      .select()
      .single()
    if (error) throw error
    return data as CertificationItem
  },

  async getIdentity(proId: string): Promise<IdentityVerification | null> {
    const { data } = await supabase
      .from('identity_verification')
      .select('*')
      .eq('professional_id', proId)
      .single()
    return (data as IdentityVerification) ?? null
  },

  async saveIdentity(proId: string, data: Partial<IdentityVerification>): Promise<void> {
    await supabase
      .from('identity_verification')
      .upsert({ ...data, professional_id: proId }, { onConflict: 'professional_id' })
  },
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/services/registrationService.ts
git commit -m "feat: registrationService con guardado progresivo y cálculo de score"
```

---

## Task 4: Hook `useRegistration`

**Files:**
- Crear: `src/hooks/useRegistration.ts`

**Interfaces:**
- Consume: `registrationService`, `useAuthStore`
- Produce:
  - `useRegistration(): { state, loading, error, saveStep, recalcScore }`
  - `state: RegistrationState | null`
  - `saveStep(step: number, data: Partial<RegistrationState>): Promise<void>`

- [ ] **Step 1: Crear `src/hooks/useRegistration.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { registrationService } from '../services/registrationService'
import type { RegistrationState } from '../types/registration'

export function useRegistration() {
  const user = useAuthStore((s) => s.user)
  const [state, setState] = useState<RegistrationState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    registrationService.load(user.id)
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar registro'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const saveStep = useCallback(async (step: number, data: Partial<RegistrationState>) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { quality_score } = await registrationService.saveStep(user.id, step, data)
      setState((prev) => prev ? { ...prev, ...data, quality_score, registration_step: Math.max(prev.registration_step, step + 1) } : prev)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      throw e
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return { state, loading, error, saveStep }
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRegistration.ts
git commit -m "feat: hook useRegistration con guardado por paso"
```

---

## Task 5: Shell del wizard + Pasos 1, 2 y 3 (obligatorios)

**Files:**
- Crear: `src/components/pro/registration/RegistrationShell.tsx`
- Crear: `src/components/pro/registration/Step1PersonalData.tsx`
- Crear: `src/components/pro/registration/Step2TradeInfo.tsx`
- Crear: `src/components/pro/registration/Step3Experience.tsx`
- Crear: `src/pages/pro/ProRegistration.tsx`

**Interfaces:**
- Consume: `useRegistration`, `registrationService`, `ALL_TRADES`, `SPECIALTIES_BY_TRADE`, `DEPARTMENTS_UY`
- Produce: página `/pro/registro` funcional para los primeros 3 pasos

- [ ] **Step 1: Crear `RegistrationShell.tsx`**

```tsx
import type { ReactNode } from 'react'

const STEP_LABELS = [
  'Datos', 'Oficio', 'Experiencia', 'Portfolio',
  'Certificaciones', 'Zona', 'Disponibilidad', 'Contacto',
  'Identidad', 'Resumen',
]

interface Props {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  children: ReactNode
  title: string
  subtitle?: string
}

export function RegistrationShell({ currentStep, totalSteps, onBack, children, title, subtitle }: Props) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ background: '#E8683A' }}>
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <button onClick={onBack} className="text-white text-xl font-bold">←</button>
          )}
          <div>
            <h1 className="text-white font-black text-lg">{title}</h1>
            {subtitle && <p className="text-white/75 text-sm">{subtitle}</p>}
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 rounded-full bg-white/30">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/90 text-xs font-bold">{currentStep}/{totalSteps}</span>
        </div>
        <p className="text-white/70 text-xs">{STEP_LABELS[currentStep - 1]}</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-5 py-6 pb-10">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear `Step1PersonalData.tsx`**

```tsx
import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  avatarUrl: string | null
  onNext: (data: Partial<RegistrationState>, avatarFile?: File) => Promise<void>
  loading: boolean
}

export function Step1PersonalData({ initial, avatarUrl, onNext, loading }: Props) {
  const [form, setForm] = useState({
    cedula: initial.cedula ?? '',
    birth_date: initial.birth_date ?? '',
    address: initial.address ?? '',
    department: initial.department ?? '',
    city: initial.city ?? '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.cedula.match(/^\d{7,8}$/)) e.cedula = 'Cédula inválida (7-8 dígitos)'
    if (!form.birth_date) e.birth_date = 'Requerido'
    if (!form.address.trim()) e.address = 'Requerido'
    if (!form.department) e.department = 'Requerido'
    if (!form.city.trim()) e.city = 'Requerido'
    if (!avatarPreview) e.avatar = 'La foto de perfil es obligatoria'
    return e
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    await onNext(form, avatarFile ?? undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Foto de perfil */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow"
          style={{ background: '#E8E0D4' }}
        >
          {avatarPreview
            ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
          }
        </div>
        <label className="text-sm font-bold cursor-pointer" style={{ color: '#E8683A' }}>
          {avatarPreview ? 'Cambiar foto' : 'Subir foto *'}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </label>
        {errors.avatar && <p className="text-red-500 text-xs">{errors.avatar}</p>}
      </div>

      {/* Campos */}
      {[
        { key: 'cedula', label: 'Cédula de identidad *', placeholder: '12345678', type: 'text' },
        { key: 'birth_date', label: 'Fecha de nacimiento *', placeholder: '', type: 'date' },
        { key: 'address', label: 'Dirección *', placeholder: 'Av. 18 de Julio 1234', type: 'text' },
        { key: 'city', label: 'Ciudad / Barrio *', placeholder: 'Pocitos', type: 'text' },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>{label}</label>
          <input
            type={type}
            value={(form as Record<string, string>)[key]}
            placeholder={placeholder}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ border: errors[key] ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
          />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}

      {/* Departamento select */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>Departamento *</label>
        <select
          value={form.department}
          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: errors.department ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        >
          <option value="">Seleccioná...</option>
          {['Montevideo','Canelones','Maldonado','Colonia','San José','Flores','Florida','Soriano','Río Negro','Paysandú','Salto','Artigas','Rivera','Tacuarembó','Cerro Largo','Treinta y Tres','Rocha','Lavalleja','Durazno','Minas'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: loading ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Crear `Step2TradeInfo.tsx`**

```tsx
import { useState } from 'react'
import { ALL_TRADES, SPECIALTIES_BY_TRADE } from '../../../lib/categories'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step2TradeInfo({ initial, onNext, loading }: Props) {
  const [trade, setTrade] = useState(initial.trade ?? '')
  const [specialties, setSpecialties] = useState<string[]>(initial.specialties ?? [])
  const [error, setError] = useState('')

  const available = trade ? (SPECIALTIES_BY_TRADE[trade] ?? []) : []

  function toggleSpecialty(s: string) {
    setSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  async function handleSubmit() {
    if (!trade) { setError('Seleccioná tu oficio principal'); return }
    setError('')
    await onNext({ trade, specialties })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: '#111111' }}>Oficio principal *</p>
        <div className="grid grid-cols-3 gap-2">
          {ALL_TRADES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => { setTrade(value); setSpecialties([]) }}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-xs font-bold transition-all"
              style={{
                border: trade === value ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: trade === value ? '#FEF0EA' : '#fff',
                color: trade === value ? '#E8683A' : '#555',
              }}
            >
              <span className="text-2xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {available.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: '#111111' }}>Especialidades (opcional)</p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  border: specialties.includes(s) ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                  background: specialties.includes(s) ? '#FEF0EA' : '#fff',
                  color: specialties.includes(s) ? '#E8683A' : '#555',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: loading ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Crear `Step3Experience.tsx`**

```tsx
import { useState } from 'react'
import type { RegistrationState, WorkMode } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step3Experience({ initial, onNext, loading }: Props) {
  const [years, setYears] = useState(initial.years_experience?.toString() ?? '')
  const [workMode, setWorkMode] = useState<WorkMode | ''>(initial.work_mode ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!years || isNaN(Number(years)) || Number(years) < 0) e.years = 'Ingresá los años de experiencia'
    if (!workMode) e.workMode = 'Seleccioná una opción'
    if (bio.length < 50) e.bio = `Mínimo 50 caracteres (${bio.length}/500)`
    if (bio.length > 500) e.bio = 'Máximo 500 caracteres'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    await onNext({ years_experience: Number(years), work_mode: workMode as WorkMode, bio })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>Años de experiencia *</label>
        <input
          type="number"
          value={years}
          min="0"
          max="60"
          onChange={(e) => setYears(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: errors.years ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        />
        {errors.years && <p className="text-red-500 text-xs mt-1">{errors.years}</p>}
      </div>

      <div>
        <p className="text-sm font-bold mb-2" style={{ color: '#111111' }}>¿Trabajás de forma...? *</p>
        <div className="flex gap-3">
          {(['independiente', 'empresa'] as WorkMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setWorkMode(m)}
              className="flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all"
              style={{
                border: workMode === m ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: workMode === m ? '#FEF0EA' : '#fff',
                color: workMode === m ? '#E8683A' : '#555',
              }}
            >
              {m === 'independiente' ? 'Independiente' : 'En empresa'}
            </button>
          ))}
        </div>
        {errors.workMode && <p className="text-red-500 text-xs mt-1">{errors.workMode}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>
          Descripción profesional * <span className="font-normal text-gray-400">({bio.length}/500)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Soy electricista con 12 años de experiencia realizando instalaciones residenciales y comerciales..."
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
          style={{ border: errors.bio ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        />
        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: loading ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Crear `ProRegistration.tsx` (shell inicial con pasos 1-3)**

```tsx
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useRegistration } from '../../hooks/useRegistration'
import { registrationService } from '../../services/registrationService'
import { RegistrationShell } from '../../components/pro/registration/RegistrationShell'
import { Step1PersonalData } from '../../components/pro/registration/Step1PersonalData'
import { Step2TradeInfo } from '../../components/pro/registration/Step2TradeInfo'
import { Step3Experience } from '../../components/pro/registration/Step3Experience'
import type { RegistrationState } from '../../types/registration'

export default function ProRegistration() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { state, loading, saveStep } = useRegistration()

  const currentStep = state?.registration_step ?? 1

  async function handleStep1(data: Partial<RegistrationState>, avatarFile?: File) {
    if (avatarFile && user?.id) {
      const url = await registrationService.uploadFile('pro-avatars', user.id, avatarFile)
      // actualizar avatar en profiles también
      await import('../../lib/supabase').then(({ supabase }) =>
        supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      )
    }
    await saveStep(1, data)
  }

  const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
    1:  { title: 'Datos personales',      subtitle: 'Paso 1 de 10' },
    2:  { title: 'Tu oficio',             subtitle: 'Paso 2 de 10' },
    3:  { title: 'Experiencia',           subtitle: 'Paso 3 de 10' },
    4:  { title: 'Portfolio',             subtitle: 'Paso 4 de 10' },
    5:  { title: 'Certificaciones',       subtitle: 'Paso 5 de 10' },
    6:  { title: 'Zona de trabajo',       subtitle: 'Paso 6 de 10' },
    7:  { title: 'Disponibilidad',        subtitle: 'Paso 7 de 10' },
    8:  { title: 'Medios de contacto',    subtitle: 'Paso 8 de 10' },
    9:  { title: 'Verificación',          subtitle: 'Paso 9 de 10' },
    10: { title: 'Resumen',               subtitle: 'Paso 10 de 10' },
  }

  const meta = STEP_TITLES[currentStep] ?? STEP_TITLES[1]

  if (loading && !state) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">🔧</div>
          <p style={{ color: '#555' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <RegistrationShell
      currentStep={currentStep}
      totalSteps={10}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={currentStep > 1 ? () => {} : undefined}
    >
      {currentStep === 1 && (
        <Step1PersonalData
          initial={state ?? {}}
          avatarUrl={user?.avatar_url ?? null}
          onNext={handleStep1}
          loading={loading}
        />
      )}
      {currentStep === 2 && (
        <Step2TradeInfo
          initial={state ?? {}}
          onNext={(data) => saveStep(2, data)}
          loading={loading}
        />
      )}
      {currentStep === 3 && (
        <Step3Experience
          initial={state ?? {}}
          onNext={(data) => saveStep(3, data)}
          loading={loading}
        />
      )}
      {currentStep > 3 && (
        <div className="text-center py-10" style={{ color: '#555' }}>
          <p className="text-lg font-bold mb-2">Paso {currentStep}</p>
          <p className="text-sm">Próximamente en la siguiente tarea...</p>
        </div>
      )}
    </RegistrationShell>
  )
}
```

- [ ] **Step 6: Actualizar `App.tsx` — reemplazar ruta ProOnboarding**

En `src/App.tsx`, reemplazar:
```tsx
import ProOnboarding from './pages/pro/ProOnboarding'
```
por:
```tsx
import ProRegistration from './pages/pro/ProRegistration'
```

Y la ruta:
```tsx
<Route path="/pro/registro" element={<ProOnboarding />} />
```
por:
```tsx
<Route path="/pro/registro" element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />
```

- [ ] **Step 7: Verificar en browser**

```bash
npm run dev
```

Navegar a `/login`, iniciar sesión como profesional, ir a `/pro/registro`.
Verificar: barra de progreso visible, paso 1 muestra formulario con todos los campos, validaciones funcionan, al presionar "Siguiente" guarda y avanza al paso 2.

- [ ] **Step 8: Commit**

```bash
git add src/components/pro/registration/ src/pages/pro/ProRegistration.tsx src/App.tsx
git commit -m "feat: wizard registro pasos 1-3 con guardado progresivo"
```

---

## Task 6: Pasos 4, 5, 6 y 7 (Portfolio, Certificaciones, Zona, Disponibilidad)

**Files:**
- Crear: `src/components/pro/registration/Step4Portfolio.tsx`
- Crear: `src/components/pro/registration/Step5Certifications.tsx`
- Crear: `src/components/pro/registration/Step6WorkZone.tsx`
- Crear: `src/components/pro/registration/Step7Availability.tsx`
- Modificar: `src/pages/pro/ProRegistration.tsx`

**Interfaces:**
- Consume: `registrationService.getPortfolio`, `addPortfolioItem`, `deletePortfolioItem`, `getCertifications`, `addCertification`, `uploadFile`

- [ ] **Step 1: Crear `Step4Portfolio.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import type { PortfolioItem } from '../../../types/registration'

interface Props {
  onNext: () => Promise<void>
  loading: boolean
}

export function Step4Portfolio({ onNext, loading }: Props) {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', work_date: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) registrationService.getPortfolio(user.id).then(setItems)
  }, [user?.id])

  async function handleAddItem() {
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (photos.length === 0) { setError('Subí al menos una foto'); return }
    if (!user?.id) return
    setUploading(true)
    try {
      const urls = await Promise.all(
        photos.map((f) => registrationService.uploadFile('pro-portfolio', user.id!, f))
      )
      const item = await registrationService.addPortfolioItem(user.id, {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        work_date: form.work_date || null,
        photo_urls: urls,
      })
      setItems((prev) => [item, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', category: '', work_date: '' })
      setPhotos([])
      setError('')
    } catch (e) {
      setError('Error al subir el trabajo')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    await registrationService.deletePortfolioItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const canProceed = items.length >= 5

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
        <p className="text-sm font-bold" style={{ color: '#111' }}>
          Trabajos subidos: <span style={{ color: canProceed ? '#0F6E56' : '#E8683A' }}>{items.length}</span>/5 mínimo
        </p>
        {!canProceed && <p className="text-xs mt-1" style={{ color: '#888' }}>Necesitás al menos 5 fotos para continuar</p>}
      </div>

      {/* Lista de trabajos */}
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl p-4 flex gap-3" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
          {item.photo_urls[0] && (
            <img src={item.photo_urls[0]} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#111' }}>{item.title}</p>
            {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
            <p className="text-xs text-gray-400">{item.photo_urls.length} foto(s)</p>
          </div>
          <button onClick={() => handleDelete(item.id)} className="text-red-400 text-sm">✕</button>
        </div>
      ))}

      {/* Formulario nuevo trabajo */}
      {showForm ? (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: '2px solid #E8683A' }}>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Nuevo trabajo</p>
          {[
            { key: 'title', label: 'Título *', placeholder: 'Instalación eléctrica completa' },
            { key: 'description', label: 'Descripción', placeholder: 'Recableado y colocación de tablero...' },
            { key: 'work_date', label: 'Fecha aproximada', placeholder: '', type: 'date' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-bold" style={{ color: '#555' }}>{label}</label>
              <input
                type={type ?? 'text'}
                value={(form as Record<string, string>)[key]}
                placeholder={placeholder}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none mt-1"
                style={{ border: '1.5px solid #E8E0D4', background: '#F9F7F4' }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold" style={{ color: '#555' }}>Fotos *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="w-full text-sm mt-1"
            />
            {photos.length > 0 && <p className="text-xs text-gray-500">{photos.length} foto(s) seleccionada(s)</p>}
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl border text-sm font-bold"
              style={{ border: '1.5px solid #E8E0D4', color: '#555' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAddItem}
              disabled={uploading}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: uploading ? '#ccc' : '#E8683A' }}
            >
              {uploading ? 'Subiendo...' : 'Agregar'}
            </button>
          </div>
        </div>
      ) : (
        items.length < 30 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold"
            style={{ borderColor: '#E8683A', color: '#E8683A' }}
          >
            + Agregar trabajo
          </button>
        )
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: (!canProceed || loading) ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : canProceed ? 'Siguiente →' : `Necesitás ${5 - items.length} foto(s) más`}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Crear `Step5Certifications.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import type { CertificationItem, CertType } from '../../../types/registration'

interface Props {
  onNext: () => Promise<void>
  loading: boolean
}

const CERT_TYPES: { value: CertType; label: string }[] = [
  { value: 'titulo',       label: 'Título técnico' },
  { value: 'certificado',  label: 'Certificado profesional' },
  { value: 'curso',        label: 'Curso realizado' },
  { value: 'carnet',       label: 'Carnet habilitante' },
]

export function Step5Certifications({ onNext, loading }: Props) {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<CertificationItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ type: 'titulo' as CertType, title: '', institution: '', issue_date: '' })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) registrationService.getCertifications(user.id).then(setItems)
  }, [user?.id])

  async function handleAdd() {
    if (!form.title.trim()) { setError('El nombre del certificado es obligatorio'); return }
    if (!file) { setError('Subí el archivo del certificado'); return }
    if (!user?.id) return
    setUploading(true)
    try {
      const url = await registrationService.uploadFile('pro-certifications', user.id, file)
      const item = await registrationService.addCertification(user.id, {
        type: form.type,
        title: form.title,
        institution: form.institution || null,
        issue_date: form.issue_date || null,
        file_url: url,
      })
      setItems((prev) => [item, ...prev])
      setShowForm(false)
      setForm({ type: 'titulo', title: '', institution: '', issue_date: '' })
      setFile(null)
      setError('')
    } catch {
      setError('Error al subir la certificación')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: '#555' }}>
        Opcional, pero suma 10 puntos a tu score. Podés agregar más después.
      </p>

      {items.map((item) => (
        <div key={item.id} className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
          <p className="font-bold text-sm" style={{ color: '#111' }}>{item.title}</p>
          <p className="text-xs text-gray-500">{CERT_TYPES.find((t) => t.value === item.type)?.label}</p>
          {item.institution && <p className="text-xs text-gray-400">{item.institution}</p>}
        </div>
      ))}

      {showForm ? (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: '2px solid #E8683A' }}>
          <div>
            <label className="text-xs font-bold" style={{ color: '#555' }}>Tipo *</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CertType }))}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none mt-1"
              style={{ border: '1.5px solid #E8E0D4', background: '#F9F7F4' }}
            >
              {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {[
            { key: 'title',       label: 'Nombre *',       placeholder: 'Técnico Electricista' },
            { key: 'institution', label: 'Institución',    placeholder: 'UTU' },
            { key: 'issue_date',  label: 'Fecha de emisión', placeholder: '', type: 'date' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-bold" style={{ color: '#555' }}>{label}</label>
              <input
                type={type ?? 'text'}
                value={(form as Record<string, string>)[key]}
                placeholder={placeholder}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none mt-1"
                style={{ border: '1.5px solid #E8E0D4', background: '#F9F7F4' }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold" style={{ color: '#555' }}>Archivo (PDF o imagen) *</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm mt-1" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border text-sm font-bold" style={{ border: '1.5px solid #E8E0D4', color: '#555' }}>Cancelar</button>
            <button onClick={handleAdd} disabled={uploading} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: uploading ? '#ccc' : '#E8683A' }}>
              {uploading ? 'Subiendo...' : 'Agregar'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold" style={{ borderColor: '#E8683A', color: '#E8683A' }}>
          + Agregar certificación
        </button>
      )}

      <button onClick={onNext} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : items.length > 0 ? 'Siguiente →' : 'Omitir por ahora →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Crear `Step6WorkZone.tsx`**

```tsx
import { useState } from 'react'
import { DEPARTMENTS_UY } from '../../../lib/categories'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

const RADIUS_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
  { label: 'Todo el departamento', value: null },
]

export function Step6WorkZone({ initial, onNext, loading }: Props) {
  const [departments, setDepartments] = useState<string[]>(initial.coverage_departments ?? [])
  const [radius, setRadius] = useState<number | null>(initial.coverage_radius_km ?? null)
  const [anywhere, setAnywhere] = useState(initial.travels_anywhere ?? false)
  const [error, setError] = useState('')

  function toggleDept(d: string) {
    setDepartments((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit() {
    if (!anywhere && departments.length === 0) { setError('Seleccioná al menos un departamento'); return }
    setError('')
    await onNext({ coverage_departments: departments, coverage_radius_km: radius, travels_anywhere: anywhere })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: '#fff', border: anywhere ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}>
        <input type="checkbox" checked={anywhere} onChange={(e) => setAnywhere(e.target.checked)} className="w-5 h-5 accent-orange-500" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Me desplazo a cualquier zona</p>
          <p className="text-xs" style={{ color: '#888' }}>Uruguay entero</p>
        </div>
      </label>

      {!anywhere && (
        <>
          <div>
            <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Departamentos *</p>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS_UY.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDept(d)}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    border: departments.includes(d) ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                    background: departments.includes(d) ? '#FEF0EA' : '#fff',
                    color: departments.includes(d) ? '#E8683A' : '#555',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Radio de cobertura</p>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setRadius(value)}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    border: radius === value ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                    background: radius === value ? '#FEF0EA' : '#fff',
                    color: radius === value ? '#E8683A' : '#555',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Crear `Step7Availability.tsx`**

```tsx
import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

const DAYS = [
  { value: 'lunes',     label: 'Lun' },
  { value: 'martes',    label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves',    label: 'Jue' },
  { value: 'viernes',   label: 'Vie' },
  { value: 'sabado',    label: 'Sáb' },
  { value: 'domingo',   label: 'Dom' },
]

export function Step7Availability({ initial, onNext, loading }: Props) {
  const [days, setDays] = useState<string[]>(initial.availability_days ?? [])
  const [from, setFrom] = useState(initial.availability_from ?? '08:00')
  const [to, setTo] = useState(initial.availability_to ?? '18:00')
  const [emergency, setEmergency] = useState(initial.emergency_24h ?? false)
  const [error, setError] = useState('')

  function toggleDay(d: string) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit() {
    if (days.length === 0) { setError('Seleccioná al menos un día'); return }
    setError('')
    await onNext({ availability_days: days, availability_from: from, availability_to: to, emergency_24h: emergency })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Días disponibles *</p>
        <div className="flex gap-2">
          {DAYS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleDay(value)}
              className="flex-1 py-3 rounded-xl border text-xs font-bold transition-all"
              style={{
                border: days.includes(value) ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: days.includes(value) ? '#FEF0EA' : '#fff',
                color: days.includes(value) ? '#E8683A' : '#555',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex gap-3">
        {[{ label: 'Desde', value: from, set: setFrom }, { label: 'Hasta', value: to, set: setTo }].map(({ label, value, set }) => (
          <div key={label} className="flex-1">
            <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>{label}</label>
            <input type="time" value={value} onChange={(e) => set(e.target.value)} className="w-full px-3 py-3 rounded-xl border text-sm outline-none" style={{ border: '1.5px solid #E8E0D4', background: '#fff' }} />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: '#fff', border: emergency ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}>
        <input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} className="w-5 h-5 accent-orange-500" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Emergencias 24 horas</p>
          <p className="text-xs" style={{ color: '#888' }}>Disponible para urgencias fuera de horario</p>
        </div>
      </label>

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Actualizar `ProRegistration.tsx` — agregar pasos 4-7**

En `src/pages/pro/ProRegistration.tsx`, agregar imports y renderizar los nuevos pasos en el bloque de switch:

```tsx
// Agregar imports
import { Step4Portfolio } from '../../components/pro/registration/Step4Portfolio'
import { Step5Certifications } from '../../components/pro/registration/Step5Certifications'
import { Step6WorkZone } from '../../components/pro/registration/Step6WorkZone'
import { Step7Availability } from '../../components/pro/registration/Step7Availability'
```

Reemplazar el bloque `{currentStep > 3 && ...}` por:

```tsx
{currentStep === 4 && (
  <Step4Portfolio
    onNext={() => saveStep(4, {})}
    loading={loading}
  />
)}
{currentStep === 5 && (
  <Step5Certifications
    onNext={() => saveStep(5, {})}
    loading={loading}
  />
)}
{currentStep === 6 && (
  <Step6WorkZone
    initial={state ?? {}}
    onNext={(data) => saveStep(6, data)}
    loading={loading}
  />
)}
{currentStep === 7 && (
  <Step7Availability
    initial={state ?? {}}
    onNext={(data) => saveStep(7, data)}
    loading={loading}
  />
)}
{currentStep > 7 && (
  <div className="text-center py-10" style={{ color: '#555' }}>
    <p className="text-lg font-bold mb-2">Paso {currentStep}</p>
    <p className="text-sm">Próximamente...</p>
  </div>
)}
```

- [ ] **Step 6: Verificar en browser**

```bash
npm run dev
```

Completar pasos 1-7, verificar que el score sube en Supabase después de cada paso.

- [ ] **Step 7: Commit**

```bash
git add src/components/pro/registration/Step4Portfolio.tsx src/components/pro/registration/Step5Certifications.tsx src/components/pro/registration/Step6WorkZone.tsx src/components/pro/registration/Step7Availability.tsx src/pages/pro/ProRegistration.tsx
git commit -m "feat: wizard registro pasos 4-7 (portfolio, certificaciones, zona, disponibilidad)"
```

---

## Task 7: Pasos 8, 9 y 10 — Contacto, Identidad y Resumen

**Files:**
- Crear: `src/components/pro/registration/Step8ContactInfo.tsx`
- Crear: `src/components/pro/registration/Step9Identity.tsx`
- Crear: `src/components/pro/registration/Step10Summary.tsx`
- Modificar: `src/pages/pro/ProRegistration.tsx`

**Interfaces:**
- Consume: `registrationService.saveIdentity`, `getIdentity`, `submitForReview`, `uploadFile`

- [ ] **Step 1: Crear `Step8ContactInfo.tsx`**

```tsx
import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step8ContactInfo({ initial, onNext, loading }: Props) {
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? '')
  const [email, setEmail] = useState(initial.contact_email ?? '')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!whatsapp.trim() && !email.trim()) { setError('Ingresá al menos WhatsApp o email'); return }
    setError('')
    await onNext({ whatsapp: whatsapp || null, contact_email: email || null })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A' }}>
        <p className="text-sm font-bold" style={{ color: '#92400E' }}>🔒 Datos privados</p>
        <p className="text-xs mt-1" style={{ color: '#92400E' }}>
          Tu WhatsApp y email nunca se muestran en tu perfil público. Solo se comparten cuando un cliente te envía una solicitud.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>WhatsApp</label>
        <div className="flex">
          <span className="px-3 py-3 rounded-l-xl border border-r-0 text-sm bg-gray-50" style={{ border: '1.5px solid #E8E0D4', borderRight: 'none', color: '#555' }}>+598</span>
          <input
            type="tel"
            value={whatsapp}
            placeholder="099 123 456"
            onChange={(e) => setWhatsapp(e.target.value)}
            className="flex-1 px-3 py-3 rounded-r-xl border text-sm outline-none"
            style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>Email de contacto</label>
        <input
          type="email"
          value={email}
          placeholder="tu@email.com"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Crear `Step9Identity.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import type { IdentityVerification } from '../../../types/registration'

interface Props {
  onNext: () => Promise<void>
  loading: boolean
}

export function Step9Identity({ onNext, loading }: Props) {
  const user = useAuthStore((s) => s.user)
  const [identity, setIdentity] = useState<Partial<IdentityVerification>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) registrationService.getIdentity(user.id).then((d) => { if (d) setIdentity(d) })
  }, [user?.id])

  async function handleUpload(field: 'cedula_front_url' | 'cedula_back_url' | 'selfie_url', file: File) {
    if (!user?.id) return
    setUploading(field)
    try {
      const url = await registrationService.uploadFile('pro-identity', user.id, file)
      const updated = { ...identity, [field]: url }
      await registrationService.saveIdentity(user.id, { [field]: url })
      setIdentity(updated)
    } catch {
      setError('Error al subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  const allDone = !!(identity.cedula_front_url && identity.cedula_back_url && identity.selfie_url)

  const DOCS: { field: 'cedula_front_url' | 'cedula_back_url' | 'selfie_url'; label: string; icon: string; hint: string }[] = [
    { field: 'cedula_front_url', label: 'Cédula (frente)',   icon: '🪪', hint: 'Foto clara del frente de tu CI' },
    { field: 'cedula_back_url',  label: 'Cédula (dorso)',    icon: '🪪', hint: 'Foto del dorso de tu CI' },
    { field: 'selfie_url',       label: 'Selfie en tiempo real', icon: '🤳', hint: 'Tomá una selfie ahora (sin lentes/gorra)' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
        <p className="text-sm font-bold" style={{ color: '#1E40AF' }}>🔒 Verificación segura</p>
        <p className="text-xs mt-1" style={{ color: '#1E40AF' }}>
          Tus documentos se almacenan con acceso restringido y solo los revisa el equipo de OficiosYa. Nunca se muestran a clientes.
        </p>
      </div>

      {DOCS.map(({ field, label, icon, hint }) => (
        <div key={field} className="rounded-2xl p-4" style={{ background: '#fff', border: identity[field] ? '2px solid #0F6E56' : '1.5px solid #E8E0D4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm" style={{ color: '#111' }}>{icon} {label}</p>
              <p className="text-xs" style={{ color: '#888' }}>{hint}</p>
            </div>
            {identity[field]
              ? <span className="text-green-600 font-bold text-sm">✓ Subida</span>
              : (
                <label className="px-3 py-2 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: uploading === field ? '#ccc' : '#E8683A' }}>
                  {uploading === field ? '...' : 'Subir'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(field, f) }} />
                </label>
              )
            }
          </div>
        </div>
      ))}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {!allDone && (
        <p className="text-xs text-center" style={{ color: '#888' }}>
          Necesitás subir los 3 documentos para continuar
        </p>
      )}

      <button onClick={onNext} disabled={!allDone || loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: (!allDone || loading) ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Crear `Step10Summary.tsx`**

```tsx
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'
import { ALL_TRADES } from '../../../lib/categories'
import { useNavigate } from 'react-router-dom'

interface Props {
  state: RegistrationState
}

const STEP_LABELS = ['Datos personales','Oficio','Experiencia','Portfolio','Certificaciones','Zona','Disponibilidad','Contacto','Identidad']

export function Step10Summary({ state }: Props) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const tradeMeta = ALL_TRADES.find((t) => t.value === state.trade)

  async function handleSubmit() {
    if (!user?.id) return
    setSubmitting(true)
    await registrationService.submitForReview(user.id)
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-xl font-black" style={{ color: '#111' }}>¡Registro enviado!</h2>
        <p className="text-sm" style={{ color: '#555' }}>
          Tu perfil está en revisión. Te avisaremos cuando sea aprobado (generalmente en 24-48 hs).
        </p>
        <div className="rounded-2xl p-4 w-full" style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC' }}>
          <p className="text-sm font-bold" style={{ color: '#166534' }}>Score actual: {state.quality_score}/100</p>
        </div>
        <button onClick={() => navigate('/pro/perfil')} className="w-full py-4 rounded-2xl font-black text-white" style={{ background: '#0F6E56' }}>
          Ver mi perfil
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Score */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-black text-base" style={{ color: '#111' }}>Score de perfil</p>
          <span className="text-2xl font-black" style={{ color: '#E8683A' }}>{state.quality_score}/100</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100">
          <div className="h-3 rounded-full transition-all" style={{ width: `${state.quality_score}%`, background: state.quality_score >= 70 ? '#0F6E56' : '#E8683A' }} />
        </div>
      </div>

      {/* Resumen de pasos */}
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const completed = state.registration_step > step
        return (
          <div key={step} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: completed ? '#0F6E56' : '#E8E0D4', color: '#fff' }}>
              {completed ? '✓' : step}
            </span>
            <p className="text-sm font-medium" style={{ color: completed ? '#111' : '#888' }}>{label}</p>
          </div>
        )
      })}

      {/* Oficio */}
      {tradeMeta && (
        <div className="rounded-2xl p-4" style={{ background: '#FEF0EA', border: '1.5px solid #FDDCC8' }}>
          <p className="text-sm font-bold" style={{ color: '#E8683A' }}>{tradeMeta.emoji} {tradeMeta.label}</p>
          {state.specialties?.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">{state.specialties.join(', ')}</p>
          )}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: '#888' }}>
        Al enviar, tu perfil quedará en revisión. No aparecerás en búsquedas hasta ser aprobado.
      </p>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 rounded-2xl font-black text-white"
        style={{ background: submitting ? '#ccc' : '#0F6E56' }}
      >
        {submitting ? 'Enviando...' : 'Enviar a revisión ✓'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Actualizar `ProRegistration.tsx` — pasos 8-10**

Agregar imports:

```tsx
import { Step8ContactInfo } from '../../components/pro/registration/Step8ContactInfo'
import { Step9Identity } from '../../components/pro/registration/Step9Identity'
import { Step10Summary } from '../../components/pro/registration/Step10Summary'
```

Reemplazar `{currentStep > 7 && ...}` por:

```tsx
{currentStep === 8 && (
  <Step8ContactInfo
    initial={state ?? {}}
    onNext={(data) => saveStep(8, data)}
    loading={loading}
  />
)}
{currentStep === 9 && (
  <Step9Identity
    onNext={() => saveStep(9, {})}
    loading={loading}
  />
)}
{currentStep >= 10 && state && (
  <Step10Summary state={state} />
)}
```

- [ ] **Step 5: Verificar en browser**

```bash
npm run dev
```

Completar el wizard completo. En el paso 10, hacer clic en "Enviar a revisión". Verificar en Supabase que `registration_completed = true` y `verification_status = 'pending'`.

- [ ] **Step 6: Commit**

```bash
git add src/components/pro/registration/Step8ContactInfo.tsx src/components/pro/registration/Step9Identity.tsx src/components/pro/registration/Step10Summary.tsx src/pages/pro/ProRegistration.tsx
git commit -m "feat: wizard registro pasos 8-10 (contacto, identidad, resumen y envío)"
```

---

## Task 8: Panel admin de verificaciones + Perfil público actualizado

**Files:**
- Crear: `src/pages/admin/AdminVerificaciones.tsx`
- Modificar: `src/pages/ProfessionalDetail.tsx`
- Modificar: `src/App.tsx`

**Interfaces:**
- Consume: `supabase` directo (queries admin), `useAuthStore`

- [ ] **Step 1: Crear `src/pages/admin/AdminVerificaciones.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { PageShell } from '../../components/layout/PageShell'

interface PendingPro {
  id: string
  profiles: { full_name: string; avatar_url: string | null }
  trade: string | null
  quality_score: number
  identity_verification: {
    id: string
    cedula_front_url: string | null
    cedula_back_url: string | null
    selfie_url: string | null
    status: string
  } | null
}

export default function AdminVerificaciones() {
  const [pros, setPros] = useState<PendingPro[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PendingPro | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('professionals')
      .select('id, trade, quality_score, profiles(full_name, avatar_url), identity_verification(id, cedula_front_url, cedula_back_url, selfie_url, status)')
      .eq('registration_completed', true)
      .eq('verification_status', 'pending')
    setPros((data as PendingPro[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDecision(proId: string, identityId: string, decision: 'verified' | 'rejected') {
    setSaving(true)
    await supabase.from('professionals').update({ verification_status: decision }).eq('id', proId)
    await supabase.from('identity_verification').update({ status: decision, admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', identityId)
    setSelected(null)
    setNotes('')
    await load()
    setSaving(false)
  }

  return (
    <PageShell>
      <div className="px-5 pt-6 pb-10">
        <h1 className="text-xl font-black mb-5" style={{ color: '#111' }}>Verificaciones pendientes</h1>

        {loading && <p style={{ color: '#888' }}>Cargando...</p>}

        {pros.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p style={{ color: '#555' }}>No hay verificaciones pendientes</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {pros.map((pro) => (
            <div
              key={pro.id}
              onClick={() => setSelected(pro)}
              className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
              style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}
            >
              {pro.profiles.avatar_url
                ? <img src={pro.profiles.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                : <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: '#F5F0E8' }}>👤</div>
              }
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: '#111' }}>{pro.profiles.full_name}</p>
                <p className="text-xs" style={{ color: '#888' }}>{pro.trade ?? 'Sin oficio'} · Score: {pro.quality_score}/100</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: '#FEF3C7', color: '#92400E' }}>Pendiente</span>
            </div>
          ))}
        </div>

        {/* Modal detalle */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full rounded-t-3xl overflow-y-auto max-h-[90vh]" style={{ background: '#F5F0E8' }}>
              <div className="px-5 pt-6 pb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-lg" style={{ color: '#111' }}>{selected.profiles.full_name}</h2>
                  <button onClick={() => setSelected(null)} style={{ color: '#888' }}>✕</button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'Cédula frente', url: selected.identity_verification?.cedula_front_url },
                    { label: 'Cédula dorso',  url: selected.identity_verification?.cedula_back_url },
                    { label: 'Selfie',         url: selected.identity_verification?.selfie_url },
                  ].map(({ label, url }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <p className="text-xs text-center font-bold" style={{ color: '#555' }}>{label}</p>
                      {url
                        ? <img src={url} alt={label} className="w-full aspect-square rounded-xl object-cover" />
                        : <div className="w-full aspect-square rounded-xl flex items-center justify-center text-2xl" style={{ background: '#E8E0D4' }}>❌</div>
                      }
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>Notas (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Motivo de rechazo o notas internas..."
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                    style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecision(selected.id, selected.identity_verification!.id, 'rejected')}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl font-black border-2"
                    style={{ border: '2px solid #ef4444', color: '#ef4444', background: '#fff' }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleDecision(selected.id, selected.identity_verification!.id, 'verified')}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl font-black text-white"
                    style={{ background: saving ? '#ccc' : '#0F6E56' }}
                  >
                    ✓ Aprobar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Agregar badge verificado en `ProfessionalDetail.tsx`**

En `src/pages/ProfessionalDetail.tsx`, localizar donde se muestra el nombre del profesional y agregar el badge después del nombre:

```tsx
{professional.verified && (
  <span
    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
    style={{ background: '#F0FDF4', color: '#0F6E56', border: '1px solid #86EFAC' }}
  >
    ✓ Profesional Verificado
  </span>
)}
```

Asegurarse de que `whatsapp`, `contact_email`, y `address` NO están renderizados en el perfil público (verificar que no existen en el JSX del componente).

- [ ] **Step 3: Agregar ruta admin en `App.tsx`**

```tsx
import AdminVerificaciones from './pages/admin/AdminVerificaciones'
```

Y en las rutas:

```tsx
<Route path="/admin/verificaciones" element={<ProtectedRoute><AdminVerificaciones /></ProtectedRoute>} />
```

- [ ] **Step 4: Verificar flujo completo en browser**

```bash
npm run dev
```

1. Registrar un profesional y completar los 10 pasos.
2. Ir a `/admin/verificaciones` — debe aparecer el profesional pendiente.
3. Aprobar — `verification_status` cambia a `verified` en Supabase.
4. Ir al perfil público `/profesional/:id` — debe mostrar badge "✓ Profesional Verificado".
5. Confirmar que WhatsApp/email NO aparecen en el perfil público.

- [ ] **Step 5: Commit final**

```bash
git add src/pages/admin/AdminVerificaciones.tsx src/pages/ProfessionalDetail.tsx src/App.tsx
git commit -m "feat: panel admin verificaciones + badge verificado en perfil público"
```
