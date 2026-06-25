import type { OfficialService, ServiceSlot } from '../types/officialServices'

export const MOCK_SERVICES: OfficialService[] = [
  {
    id: 'samsung-uy',
    company_name: 'Samsung Service Center',
    brands: ['Samsung'],
    categories: ['aire_acondicionado', 'tv', 'heladera'],
    city: 'Montevideo',
    zones: ['Pocitos', 'Punta Carretas', 'Centro'],
    website: 'https://www.samsung.com/uy/support/',
    booking_url: 'https://www.samsung.com/uy/support/service-center/',
    integration_type: 'mock',
    plan: 'destacado',
    active: true,
  },
  {
    id: 'lg-uy',
    company_name: 'LG Service Oficial',
    brands: ['LG'],
    categories: ['aire_acondicionado', 'lavarropas'],
    city: 'Montevideo',
    zones: ['Carrasco', 'Malvín', 'Pocitos'],
    website: 'https://www.lg.com/uy/support',
    booking_url: 'https://www.lg.com/uy/support/service',
    integration_type: 'mock',
    plan: 'agenda',
    active: true,
  },
  {
    id: 'whirlpool-uy',
    company_name: 'Whirlpool Uruguay',
    brands: ['Whirlpool', 'Consul'],
    categories: ['lavarropas', 'horno'],
    city: 'Montevideo',
    zones: ['Centro', 'Cordón', 'Tres Cruces'],
    website: 'https://www.whirlpool.com.uy/',
    booking_url: 'https://www.whirlpool.com.uy/servicio-tecnico',
    integration_type: 'mock',
    plan: 'agenda',
    active: true,
  },
  {
    id: 'midea-uy',
    company_name: 'Midea Técnica',
    brands: ['Midea', 'BGH'],
    categories: ['aire_acondicionado'],
    city: 'Montevideo',
    zones: ['La Blanqueada', 'Parque Batlle', 'Buceo'],
    website: 'https://www.midea.com/uy',
    integration_type: 'mock',
    plan: 'presencia',
    active: true,
  },
  {
    id: 'james-uy',
    company_name: 'James Service',
    brands: ['James'],
    categories: ['lavarropas', 'heladera'],
    city: 'Montevideo',
    zones: ['Punta Carretas', 'Pocitos', 'Cordón'],
    website: 'https://www.james.com.uy/',
    integration_type: 'mock',
    plan: 'presencia',
    active: true,
  },
]

const SLOT_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
// Deterministic availability: seed based on serviceId + date + time
function isAvailable(serviceId: string, date: string, time: string): boolean {
  const hash = (serviceId + date + time).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return hash % 10 < 6  // ~60% available
}

export function generateMockSlots(serviceId: string, dates: string[]): ServiceSlot[] {
  const slots: ServiceSlot[] = []
  for (const date of dates) {
    const d = new Date(date + 'T12:00:00')
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue  // no weekends
    for (const time of SLOT_TIMES) {
      slots.push({ date, time, available: isAvailable(serviceId, date, time) })
    }
  }
  return slots
}
