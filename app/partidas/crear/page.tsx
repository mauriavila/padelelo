'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DIVISIONS } from '@/lib/divisions'

export default function CrearPartidaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    location: '', date: '', time: '', division: '', is_public: true,
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.location || !form.date || !form.time) {
      setError('Ubicación, fecha y hora son obligatorios')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString()
    const invite_code = !form.is_public ? Math.random().toString(36).substring(2, 8).toUpperCase() : null

    const { data, error: err } = await supabase
      .from('matches')
      .insert({ creator_id: user.id, location: form.location, scheduled_at, division: form.division ? parseInt(form.division) : null, is_public: form.is_public, invite_code })
      .select().single()

    if (err) { setError(err.message); setLoading(false); return }
    await supabase.from('match_players').insert({ match_id: data.id, player_id: user.id })
    router.push(`/partidas/${data.id}`)
  }

  const inputClass = "w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
  const inputStyle = { background: 'rgba(18,18,31,0.8)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={20} className="text-white/60" />
        </Link>
        <h1 className="text-xl font-black text-white tracking-tight">Nueva partida</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
            <MapPin size={12} /> Ubicación / Club
          </label>
          <input type="text" placeholder="Ej: Club Pádel Córdoba - Cancha 3"
            value={form.location} onChange={e => update('location', e.target.value)}
            className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
              <Calendar size={12} /> Fecha
            </label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
              <Clock size={12} /> Hora
            </label>
            <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">División (opcional)</label>
          <select value={form.division} onChange={e => update('division', e.target.value)}
            className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Cualquier nivel</option>
            {DIVISIONS.map(d => (
              <option key={d.id} value={d.id}>Div {d.id} · {d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">Visibilidad</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'rgba(18,18,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={() => update('is_public', true)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${form.is_public ? 'text-white' : 'text-white/30'}`}
              style={form.is_public ? { background: 'linear-gradient(135deg, #e94560, #c73652)', boxShadow: '0 2px 12px rgba(233,69,96,0.3)' } : {}}>
              🌐 Pública
            </button>
            <button type="button" onClick={() => update('is_public', false)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${!form.is_public ? 'text-white' : 'text-white/30'}`}
              style={!form.is_public ? { background: 'linear-gradient(135deg, #e94560, #c73652)', boxShadow: '0 2px 12px rgba(233,69,96,0.3)' } : {}}>
              🔒 Privada
            </button>
          </div>
        </div>

        {error && (
          <p className="text-brand-red text-sm flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="btn-primary w-full text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}>
          {loading ? 'Creando...' : 'Crear partida'}
        </button>
      </form>
    </div>
  )
}
