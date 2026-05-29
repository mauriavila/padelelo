import { createClient } from '@/lib/supabase/server'
import { Match } from '@/lib/types'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'

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

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white">
            PADEL<span className="text-brand-red">ELO</span>
          </h1>
          <p className="text-brand-muted text-xs">Partidas disponibles</p>
        </div>
        <Link
          href="/partidas/crear"
          className="bg-brand-red text-white text-sm font-bold px-4 py-2 rounded-xl uppercase tracking-wide hover:bg-red-600 transition-colors"
        >
          + Crear
        </Link>
      </div>

      {matches && matches.length > 0 ? (
        <div>
          {matches.map(match => (
            <MatchCard key={match.id} match={match as Match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎾</p>
          <p className="text-white font-semibold mb-1">No hay partidas todavía</p>
          <p className="text-brand-muted text-sm mb-6">¡Creá la primera y sumá jugadores!</p>
          <Link
            href="/partidas/crear"
            className="bg-brand-red text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wide hover:bg-red-600 transition-colors"
          >
            Crear partida
          </Link>
        </div>
      )}
    </div>
  )
}
