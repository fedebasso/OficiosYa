import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, ClipboardList, Wrench, MessageCircle } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'
import { useRequestStore, type ServiceRequest } from '../store/requestStore'
import { useProRequestsStore } from '../store/proRequestsStore'
import { requestService } from '../services/requestService'
import { visitSuccessMessage, type VisitCommand, type VisitInput, type VisitReport } from '../lib/visitFlow'
import { formatUYU } from '../lib/money'

const card = 'rounded-[20px] border border-[#ECE4D8] bg-white p-5'
const primary = 'w-full rounded-2xl bg-[#E8683A] px-4 py-3.5 text-sm font-extrabold text-white disabled:opacity-50'
const secondary = 'w-full rounded-xl border border-[#ECE4D8] bg-white px-4 py-3 text-sm font-bold disabled:opacity-50'
const inputClass = 'mt-1 w-full rounded-xl border border-[#ECE4D8] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#E8683A]'
const blank: VisitInput = { kind: 'resolved', description: '', labor: 0, materials: 0, other: 0, duration: '', validUntil: '' }
const titles = { resolved: 'Trabajo resuelto', quote: 'Presupuesto', evaluation: 'Solo evaluación' }
const responses = { accepted: 'Aceptado', rejected: 'Rechazado', changes_requested: 'Cambios solicitados' }

function Report({ report }: { report: VisitReport }) {
  return <div className={card}>
    <p className="text-xs font-bold text-[#D4571F]">{titles[report.kind]} · versión {report.version}</p>
    {report.sourceQuoteVersion && <p className="mt-1 text-xs text-[#7A6E5E]">Cierre del presupuesto · versión {report.sourceQuoteVersion}</p>}
    <p className="my-3 whitespace-pre-wrap text-sm">{report.description}</p>
    <dl className="space-y-2 text-sm">
      {[['Mano de obra', report.labor], ['Materiales', report.materials], ['Otros costos acordados', report.other]].map(([label, amount]) => <div className="flex justify-between gap-3" key={label}><dt className="text-[#7A6E5E]">{label}</dt><dd>{formatUYU(Number(amount))}</dd></div>)}
      <div className="flex justify-between border-t border-[#ECE4D8] pt-3 text-xl font-extrabold"><dt>Total</dt><dd>{formatUYU(report.total)}</dd></div>
    </dl>
    {report.kind === 'quote' && <p className="mt-3 text-xs text-[#7A6E5E]">Duración: {report.duration} · Válido hasta {report.validUntil}</p>}
    {report.response && <div className="mt-4 rounded-xl bg-[#FAF6F0] p-3 text-sm"><strong>{responses[report.response.decision]}</strong>{report.response.note && <p className="mt-1 whitespace-pre-wrap">{report.response.note}</p>}</div>}
    <p className="mt-3 text-xs text-[#7A6E5E]">Enviado {new Date(report.createdAt).toLocaleString('es-UY')}</p>
  </div>
}

export default function TrabajoVisita() {
  const { id = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  // Account/request key isolates form state when navigating between jobs.
  return <VisitPage key={`${user?.id}:${id}`} id={id} />
}

function VisitPage({ id }: { id: string }) {
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'
  const [req, setReq] = useState<ServiceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const locked = useRef(false)
  const draftKey = `ofix_visit_draft_${user?.id}_${id}`
  const [draft, setDraft] = useState<VisitInput>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) ?? 'null')
      if (saved && ['resolved', 'quote', 'evaluation'].includes(saved.kind) && typeof saved.description === 'string') return { ...blank, ...saved }
    } catch { /* A damaged draft does not prevent opening the work. */ }
    return blank
  })
  const [editing, setEditing] = useState(false)
  const [finishingQuote, setFinishingQuote] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    let alive = true
    requestService.getAll().then((rows) => { if (alive) { setReq(rows.find((r) => r.id === id) ?? null); setLoading(false) } }).catch((e) => { if (alive) { setError(e instanceof Error ? e.message : 'No se pudo cargar el trabajo.'); setLoading(false) } })
    return () => { alive = false }
  }, [id])

  const latest = req?.visitReports?.at(-1)
  const open = req && ['confirmed', 'in_progress'].includes(req.status)
  const canWrite = isPro && open && (!latest || (latest.response && latest.response.decision !== 'accepted'))
  const canRespond = !isPro && open && latest && !latest.response
  const total = Math.round((Number(draft.labor) + Number(draft.materials) + Number(draft.other)) * 100) / 100
  const back = isPro ? '/pro/solicitudes' : '/mis-solicitudes'

  function saveDraft() {
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); setNotice('Borrador guardado. Podés continuar más tarde.'); setError('') }
    catch { setError('No se pudo guardar el borrador. Conservá esta pantalla abierta y reintentá.'); setNotice('') }
  }

  async function act(command: VisitCommand) {
    if (locked.current) return
    locked.current = true; setSaving(true); setError(''); setNotice('')
    try {
      const updated = await requestService.updateVisit(id, command)
      setReq(updated)
      useRequestStore.setState((s) => ({ requests: s.requests.map((r) => r.id === id ? updated : r) }))
      useProRequestsStore.setState((s) => ({ requests: s.requests.map((r) => r.id === id ? updated : r) }))
      setEditing(false)
      setFinishingQuote(false)
      setNotice(visitSuccessMessage(command))
      if (command.type === 'submit') { try { localStorage.removeItem(draftKey) } catch { /* Sent report remains authoritative. */ } }
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar. Reintentá. Tus datos siguen acá.') }
    finally { locked.current = false; setSaving(false) }
  }

  const header = <div className="bg-white px-5 pb-4 pt-8 border-b border-[#ECE4D8]"><Link to={back} className="inline-flex items-center gap-1 text-sm text-[#7A6E5E]"><ChevronLeft size={18} /> Mis solicitudes</Link><h1 className="mt-3 text-2xl font-extrabold text-[#1A1712]">{isPro ? 'Resultado de la visita' : 'Tu trabajo'}</h1></div>
  return <PageShell header={header} showBottomNav={false}><div className="space-y-4 px-5 py-5 text-[#1A1712]">
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {loading ? <p>Cargando trabajo…</p> : !req ? <p>No encontramos este trabajo en tu cuenta.</p> : <>
      <section className={card}><p className="text-xs font-bold uppercase tracking-wide text-[#D4571F]">Solicitud</p><p className="mt-2 text-sm">{req.description}</p>{req.scheduled_date && <p className="mt-3 text-xs text-[#7A6E5E]">Visita: {new Date(req.scheduled_date).toLocaleString('es-UY')}</p>}<Link to={`/solicitud/${id}/chat`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#D4571F]"><MessageCircle size={16} /> Abrir conversación</Link></section>
      {latest && <Report report={latest} />}
      {req.status === 'completed' && <section className={card}><CheckCircle2 className="text-green-700" /><h2 className="mt-2 font-extrabold">Resumen confirmado</h2><p className="mt-2 text-sm text-[#7A6E5E]">El importe quedó registrado. Esta confirmación no acredita un pago.</p>{!isPro && <Link className="mt-3 block text-sm font-bold text-[#D4571F]" to={`/solicitud/${id}`}>Ver detalle y dejar reseña</Link>}</section>}
      {latest?.kind === 'quote' && latest.response?.decision === 'accepted' && <section className={card}><h2 className="font-extrabold">Presupuesto aceptado</h2><p className="mt-2 text-sm text-[#7A6E5E]">{isPro ? 'Cuando termines, registrá el resultado y el importe final. Podés hacerlo más tarde.' : 'Coordinen por la conversación cuándo realizar el trabajo. Todavía no se registró como finalizado.'}</p>{isPro && <button className={`${primary} mt-4`} onClick={() => { if (!draft.description) setDraft({ ...blank, kind: 'resolved', labor: latest.labor, materials: latest.materials, other: latest.other }); setFinishingQuote(true); setEditing(true) }}>{draft.description ? 'Continuar cierre guardado' : 'Registrar trabajo terminado'}</button>}</section>}
      {canWrite && !editing && <section><h2 className="text-xl font-extrabold">¿Cómo fue la visita?</h2><p className="mt-1 mb-4 text-sm text-[#7A6E5E]">Registralo cuando tengas un momento.</p>{([
        ['resolved', 'Ya resolví el problema', 'Contá lo que hiciste y cuánto acordaron.', Wrench],
        ['quote', 'Voy a pasar un presupuesto', 'Describí el trabajo y su costo estimado.', ClipboardList],
        ['evaluation', 'Solo hice la evaluación', 'Registrá la visita y lo que encontraste.', CheckCircle2],
      ] as const).map(([kind, title, desc, Icon]) => <button key={kind} type="button" className={`${card} mb-3 flex w-full gap-3 text-left`} onClick={() => { setDraft((d) => ({ ...d, kind })); setEditing(true) }}><Icon size={22} className="shrink-0 text-[#D4571F]" /><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-[#7A6E5E]">{desc}</span></span></button>)}{draft.description && <button className={secondary} onClick={() => setEditing(true)}>Continuar borrador</button>}</section>}
      {(canWrite || finishingQuote) && editing && <form className={`${card} space-y-4`} onSubmit={(e) => { e.preventDefault(); void act(finishingQuote && latest ? { type: 'complete_quote', quoteVersion: latest.version, report: draft } : { type: 'submit', report: draft }) }}>
        <h2 className="text-xl font-extrabold">{finishingQuote ? 'Trabajo terminado' : titles[draft.kind]}</h2>
        {finishingQuote && <p className="text-sm text-[#7A6E5E]">Los importes del presupuesto se cargaron como referencia. Actualizalos si el costo real cambió.</p>}
        <p className="text-sm text-[#7A6E5E]">Incluí únicamente los costos acordados. Si hubo un costo de visita, detallalo en otros costos; no lo sumes dos veces.</p>
        <fieldset disabled={saving} className="space-y-4">
          <label className="block text-sm font-bold">Detalle<textarea required minLength={10} maxLength={3000} className={inputClass} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          {(['labor', 'materials', 'other'] as const).map((key, i) => <label key={key} className="block text-sm font-bold">{['Mano de obra', 'Materiales', 'Otros costos acordados'][i]} · $<input type="number" inputMode="decimal" min="0" max="500000" step="0.01" required className={inputClass} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })} /></label>)}
          {draft.kind === 'quote' && <><label className="block text-sm font-bold">Duración estimada<input required maxLength={100} placeholder="Por ejemplo, 2 horas" className={inputClass} value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} /></label><label className="block text-sm font-bold">Válido hasta<input type="date" required className={inputClass} value={draft.validUntil} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })} /></label></>}
          <div className="flex justify-between text-xl font-extrabold"><span>Total</span><span>{formatUYU(total)}</span></div>
          <button type="submit" className={primary}>{saving ? 'Guardando…' : finishingQuote ? 'Enviar cierre al cliente' : draft.kind === 'quote' ? 'Enviar presupuesto' : 'Enviar resumen al cliente'}</button>
          <button type="button" onClick={saveDraft} className={secondary}>Guardar borrador</button>
          <button type="button" className="w-full text-sm text-[#7A6E5E]" onClick={() => { saveDraft(); setEditing(false); setFinishingQuote(false) }}>{finishingQuote ? 'Volver al presupuesto' : 'Volver a las opciones'}</button>
        </fieldset>
      </form>}
      {canRespond && <section className={`${card} space-y-3`}><h2 className="font-extrabold">Revisá lo que envió el profesional</h2><p className="text-sm text-[#7A6E5E]">Confirmá si coincide con lo acordado o pedí una aclaración.</p><button disabled={saving} className={primary} onClick={() => void act({ type: 'respond', version: latest.version, decision: 'accepted' })}>{saving ? 'Guardando…' : latest.kind === 'quote' ? 'Aceptar presupuesto' : 'Confirmar resumen'}</button><label className="block text-sm font-bold">Consulta o motivo<textarea disabled={saving} maxLength={2000} className={inputClass} placeholder="Contale qué querés revisar" value={note} onChange={(e) => setNote(e.target.value)} /></label><button disabled={saving || !note.trim()} className={secondary} onClick={() => void act({ type: 'respond', version: latest.version, decision: 'changes_requested', note })}>Pedir cambios o aclaración</button>{latest.kind === 'quote' && <button disabled={saving || !note.trim()} className={secondary} onClick={() => void act({ type: 'respond', version: latest.version, decision: 'rejected', note })}>Rechazar presupuesto</button>}</section>}
      {isPro && latest && !latest.response && <p className="text-sm text-[#7A6E5E]">Esperando la respuesta del cliente. El envío queda guardado aunque cierres la aplicación.</p>}
      {!isPro && !latest && <p className="text-sm text-[#7A6E5E]">Cuando el profesional registre la visita, vas a ver su resumen o presupuesto acá.</p>}
      {(req.visitReports?.length ?? 0) > 1 && <details><summary className="cursor-pointer py-3 text-sm font-bold">Ver versiones anteriores</summary><div className="space-y-3">{req.visitReports!.slice(0, -1).map((r) => <Report key={r.version} report={r} />)}</div></details>}
    </>}
  </div></PageShell>
}
