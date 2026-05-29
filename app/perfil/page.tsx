export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DivisionBadge from '@/components/DivisionBadge'
import MatchCard from '@/components/MatchCard'
import { Match } from '@/lib/types'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myMatches } = await supabase
    .from('match_players')
    .select('match:matches(*, creator:profiles(*))')
    .eq('player_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(10)

  const matches = (myMatches ?? [])
    .map((mp: any) => mp.match)
    .filter(Boolean)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="bg-brand-card border border-brand-navy rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center text-2xl font-black text-white">
            {profile?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{profile?.username ?? 'Jugador'}</p>
            <DivisionBadge division={profile?.division ?? 3} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-brand-red">{profile?.elo ?? 1000}</p>
            <p className="text-brand-muted text-xs">ELO</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-white">{profile?.wins ?? 0}</p>
            <p className="text-brand-muted text-xs">Victorias</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-white">{profile?.losses ?? 0}</p>
            <p className="text-brand-muted text-xs">Derrotas</p>
          </div>
        </div>
      </div>

      <h2 className="text-white font-bold mb-3">Mis partidas</h2>
      {matches.length > 0 ? (
        matches.map((m: any) => <MatchCard key={m.id} match={m as Match} />)
      ) : (
        <p className="text-brand-muted text-sm">Todavía no participaste en ninguna partida.</p>
      )}

      <form action={signOut} className="mt-8 mb-4">
        <button type="submit" className="text-brand-muted text-sm hover:text-white transition-colors">
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
