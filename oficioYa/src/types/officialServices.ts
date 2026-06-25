export type IntegrationType = 'mock' | 'google_calendar' | 'api' | 'booking_url'
export type ServicePlan = 'presencia' | 'agenda' | 'destacado'

export interface OfficialService {
  id: string
  company_name: string
  logo_url?: string
  brands: string[]
  categories: string[]
  city: string
  zones: string[]
  website?: string
  booking_url?: string
  integration_type: IntegrationType
  plan: ServicePlan
  active: boolean
}

export interface ServiceSlot {
  date: string   // 'YYYY-MM-DD'
  time: string   // 'HH:MM'
  available: boolean
}

export interface PendingBooking {
  serviceId: string
  date: string
  time: string
  createdAt: string
}
