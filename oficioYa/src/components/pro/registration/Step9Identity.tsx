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
      const path = await registrationService.uploadPrivateFile('pro-identity', user.id, file)
      const updated = { ...identity, [field]: path }
      await registrationService.saveIdentity(user.id, { [field]: path })
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
