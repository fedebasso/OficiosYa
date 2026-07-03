import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { IS_DEMO_MODE } from '../../lib/env'
import { registrationService } from '../../services/registrationService'
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
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchPending(): Promise<PendingPro[]> {
    if (IS_DEMO_MODE) return [] // demo: sin cola de verificación real
    const { data } = await supabase
      .from('professionals')
      .select('id, trade, quality_score, profiles(full_name, avatar_url), identity_verification(id, cedula_front_url, cedula_back_url, selfie_url, status)')
      .eq('registration_completed', true)
      .eq('verification_status', 'pending')
    return (data as unknown as PendingPro[]) ?? []
  }

  async function load() {
    setLoading(true)
    setPros(await fetchPending())
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    fetchPending().then((data) => {
      if (!active) return
      setPros(data)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function openModal(pro: PendingPro) {
    setSelected(pro)
    if (pro.identity_verification) {
      const { cedula_front_url, cedula_back_url, selfie_url } = pro.identity_verification
      const urls: Record<string, string> = {}
      for (const [key, path] of Object.entries({ cedula_front_url, cedula_back_url, selfie_url })) {
        if (path) {
          try {
            urls[key] = await registrationService.getSignedUrl('pro-identity', path)
          } catch {
            urls[key] = ''
          }
        }
      }
      setSignedUrls(urls)
    }
  }

  async function handleDecision(proId: string, identityId: string, decision: 'verified' | 'rejected') {
    setSaving(true)
    if (!IS_DEMO_MODE) {
      await supabase.from('professionals').update({ verification_status: decision }).eq('id', proId)
      await supabase.from('identity_verification').update({ status: decision, admin_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', identityId)
    }
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
              onClick={() => openModal(pro)}
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
                    { label: 'Cédula frente', url: signedUrls['cedula_front_url'] },
                    { label: 'Cédula dorso',  url: signedUrls['cedula_back_url'] },
                    { label: 'Selfie',         url: signedUrls['selfie_url'] },
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
