import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'

interface TopPro {
  id: string
  avg_rating: number
  jobs_count: number
  categories: string[]
  zone: string
  profiles: { full_name: string; avatar_url: string | null }
}

export function TopRated() {
  const [pros, setPros] = useState<TopPro[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('professionals')
      .select('id, avg_rating, jobs_count, categories, zone, profiles(full_name, avatar_url)')
      .gte('avg_rating', 4.5)
      .gte('jobs_count', 3)
      .order('avg_rating', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setPros(data as unknown as TopPro[]) })
  }, [])

  if (pros.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-black text-base" style={{ color: '#111', letterSpacing: '-0.3px' }}>
        ⭐ Mejor calificados
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {pros.map((pro) => {
          const { emoji, avatarGradient, accent } = getCategoryMeta(pro.categories[0] ?? '')
          const initials = getInitials(pro.profiles.full_name)
          return (
            <button
              key={pro.id}
              type="button"
              onClick={() => navigate(`/profesional/${pro.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl active:opacity-80 transition-opacity"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #EDE8DE',
                width: 110,
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              <div
                className="rounded-2xl flex items-center justify-center font-black overflow-hidden"
                style={{ width: 52, height: 52, background: pro.profiles.avatar_url ? undefined : avatarGradient }}
              >
                {pro.profiles.avatar_url
                  ? <img src={pro.profiles.avatar_url} alt={pro.profiles.full_name} className="w-full h-full object-cover" />
                  : <span style={{ color: accent, fontSize: 18 }}>{initials}</span>
                }
              </div>
              <p className="text-xs font-bold text-center leading-tight truncate w-full" style={{ color: '#111' }}>
                {pro.profiles.full_name.split(' ')[0]}
              </p>
              <div className="flex items-center gap-0.5">
                <span style={{ color: '#F59E0B', fontSize: 11 }}>★</span>
                <span className="text-xs font-black" style={{ color: '#111' }}>{pro.avg_rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px]" style={{ color: '#999' }}>{emoji} {pro.zone}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
