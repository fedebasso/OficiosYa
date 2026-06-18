import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

export function scoreProfessional(pro: ProfessionalWithProfile, clientZone: string): number {
  let score = 0
  if (pro.available_now) score += 40
  if (clientZone && pro.zone === clientZone) score += 25
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min(pro.jobs_count / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5
  return score
}
