import type { ProfessionalWithProfile } from '../hooks/useProfessionals'
import { isInRadius } from './barrio-coords'

export interface ScoreBreakdown {
  total: number
  specialist: boolean
  sameZone: boolean
  rating: number | null
  jobs: number
}

function specializationPoints(pro: ProfessionalWithProfile, ticketCategory?: string): { pts: number; specialist: boolean } {
  if (!ticketCategory) return { pts: 0, specialist: false }
  if (pro.categories[0] === ticketCategory) return { pts: 35, specialist: true }
  if (pro.categories.includes(ticketCategory)) return { pts: 15, specialist: false }
  return { pts: -100, specialist: false }
}

function geoPoints(pro: ProfessionalWithProfile, clientZone: string): { pts: number; sameZone: boolean } {
  if (clientZone && pro.zone === clientZone) return { pts: 25, sameZone: true }
  if (clientZone && isInRadius(pro.zone, pro.radius_km ?? null, clientZone)) return { pts: 12, sameZone: false }
  return { pts: 0, sameZone: false }
}

export function scoreProfessional(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory?: string,
): number {
  let score = 0
  score += specializationPoints(pro, ticketCategory).pts
  score += geoPoints(pro, clientZone).pts
  if (pro.available_now) score += 40
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min(pro.jobs_count / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5
  return score
}

export function scoreBreakdown(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory: string,
): ScoreBreakdown {
  const spec = specializationPoints(pro, ticketCategory)
  const geo = geoPoints(pro, clientZone)
  return {
    total: scoreProfessional(pro, clientZone, ticketCategory),
    specialist: spec.specialist,
    sameZone: geo.sameZone,
    rating: pro.avg_rating ?? null,
    jobs: pro.jobs_count,
  }
}
