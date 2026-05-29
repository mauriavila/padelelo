export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Match } from '@/lib/types'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, creator:profiles(*)')
    .eq('is_public', true)
    .in('status', ['open', 'full'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50)

  const count = matches?.length ?? 0

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-white">PADEL</span>
            <span className="gradient-text">ELO</span>
          </h1>
          <p className="text-white/40 text-xs mt-0.5">
            {count > 0 ? `${count} partida${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}` : 'Sin partidas activas'}
          </p>
        </div>
        <Link
          href="/partidas/crear"
          className="btn-primary flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Crear
        </Link>
      </div>

      {count > 0 ? (
        <div>
          {matches!.map(match => (
            <MatchCard key={match.id} match={match as Match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎾</div>
          <p className="text-white font-bold text-lg mb-1">Sin partidas todavía</p>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Creá la primera partida y<br />sumá jugadores de tu nivel.
          </p>
          <Link
            href="/partidas/crear"
            className="btn-primary inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl text-sm"
            style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Crear partida
          </Link>
        </div>
      )}
    </div>
  )
}
