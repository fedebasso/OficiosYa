import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { PageShell } from '../../components/layout/PageShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Camera } from 'lucide-react'

const CATEGORIES = [
  { id: 'electricista', label: 'Electricista' },
  { id: 'plomero', label: 'Sanitario' },
  { id: 'aire_acondicionado', label: 'Aire Acond.' },
]

const ZONES = [
  'Pocitos',
  'Malvín',
  'Centro',
  'Carrasco',
  'Punta Carretas',
  'Cordón',
  'Tres Cruces',
  'La Blanqueada',
  'Buceo',
  'Parque Batlle',
]

export default function ProProfile() {
  const user = useAuthStore((s) => s.user)
  const [bio, setBio] = useState('')
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? '')
  const [zone, setZone] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )

  const handleSave = async () => {
    // En modo demo solo simula el guardado
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageShell header={<Header title="Mi perfil" />}>
      <div className="p-4 flex flex-col gap-4 pb-8">
        <div className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar src={user?.avatar_url ?? null} name={user?.full_name ?? ''} size="lg" />
            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1">
              <Camera size={14} />
            </button>
          </div>
          <p className="font-semibold text-text-main">{user?.full_name}</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Descripción</h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Contá brevemente tu experiencia y especialidades..."
            className="border border-border-dark rounded-lg px-3 py-2 text-sm text-text-main bg-bg-elevated placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">WhatsApp</h3>
          <input
            type="tel"
            value={whatsapp ?? ''}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="598 9X XXX XXX"
            className="border border-border-dark rounded-lg px-3 py-2 text-sm text-text-main bg-bg-elevated placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Servicios</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-elevated text-text-secondary border-border-dark'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Zona de trabajo</h3>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="border border-border-dark rounded-lg px-3 py-2 text-sm text-text-main bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccioná un barrio</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <Button variant="primary" fullWidth onClick={handleSave}>
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </Button>
      </div>
    </PageShell>
  )
}
