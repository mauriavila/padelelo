'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DIVISIONS } from '@/lib/divisions'

export default function CrearPartidaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    location: '',
    date: '',
    time: '',
    division: '',
    is_public: true,
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
    const invite_code = !form.is_public
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : null

    const { data, error: err } = await supabase
      .from('matches')
      .insert({
        creator_id: user.id,
        location: form.location,
        scheduled_at,
        division: form.division ? parseInt(form.division) : null,
        is_public: form.is_public,
        invite_code,
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }

    await supabase.from('match_players').insert({
      match_id: data.id,
      player_id: user.id,
    })

    router.push(`/partidas/${data.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold text-white mb-6">Nueva partida</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-brand-muted text-xs uppercase tracking-wide mb-1 block">
            Ubicación / Club *
          </label>
          <input
            type="text"
            placeholder="Ej: Club Pádel Córdoba - Cancha 3"
            value={form.location}
            onChange={e => update('location', e.target.value)}
            className="w-full bg-brand-card border border-brand-navy text-white rounded-xl px-4 py-3 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-brand-muted text-xs uppercase tracking-wide mb-1 block">Fecha *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => update('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-brand-card border border-brand-navy text-white rounded-xl px-4 py-3 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="text-brand-muted text-xs uppercase tracking-wide mb-1 block">Hora *</label>
            <input
              type="time"
              value={form.time}
              onChange={e => update('time', e.target.value)}
              className="w-full bg-brand-card border border-brand-navy text-white rounded-xl px-4 py-3 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-brand-muted text-xs uppercase tracking-wide mb-1 block">
            División (opcional)
          </label>
          <select
            value={form.division}
            onChange={e => update('division', e.target.value)}
            className="w-full bg-brand-card border border-brand-navy text-white rounded-xl px-4 py-3 text-sm focus:border-brand-red focus:outline-none"
          >
            <option value="">Cualquier nivel</option>
            {DIVISIONS.map(d => (
              <option key={d.id} value={d.id}>Div {d.id} · {d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update('is_public', true)}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors
              ${form.is_public
                ? 'bg-brand-red border-brand-red text-white'
                : 'bg-brand-card border-brand-navy text-brand-muted'}`}
          >
            🌐 Pública
          </button>
          <button
            type="button"
            onClick={() => update('is_public', false)}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors
              ${!form.is_public
                ? 'bg-brand-red border-brand-red text-white'
                : 'bg-brand-card border-brand-navy text-brand-muted'}`}
          >
            🔒 Privada
          </button>
        </div>

        {error && <p className="text-brand-red text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-red text-white font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'CREAR PARTIDA'}
        </button>
      </form>
    </div>
  )
}
