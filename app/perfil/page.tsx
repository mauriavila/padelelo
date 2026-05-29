export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import DivisionBadge from '@/components/DivisionBadge'
import MatchCard from '@/components/MatchCard'
import { Match } from '@/lib/types'
import { getDivisionColor } from '@/lib/divisions'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: myMatches } = await supabase
    .from('match_players')
    .select('match:matches(*, creator:profiles(*))')
    .eq('player_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(10)

  const matches = (myMatches ?? []).map((mp: any) => mp.match).filter(Boolean)
  const divColor = getDivisionColor(profile?.division ?? 3)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}55)`, border: `2px solid ${divColor}50` }}>
              {profile?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight mb-1">{profile?.username ?? 'Jugador'}</p>
            <DivisionBadge division={profile?.division ?? 3} size="md" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'ELO', value: profile?.elo ?? 1000, gradient: true },
            { label: 'Victorias', value: profile?.wins ?? 0, gradient: false },
            { label: 'Derrotas', value: profile?.losses ?? 0, gradient: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, rgba(18,18,31,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className={`text-2xl font-black mb-0.5 ${stat.gradient ? 'gradient-text' : 'text-white'}`}>
                {stat.value}
              </p>
              <p className="text-white/30 text-xs uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-white/60 font-bold mb-3 text-xs uppercase tracking-widest">Mis partidas</h2>
      {matches.length > 0
        ? matches.map((m: any) => <MatchCard key={m.id} match={m as Match} />)
        : <p className="text-white/30 text-sm py-4">Todavía no participaste en ninguna partida.</p>}

      <form action={signOut} className="mt-8 mb-4">
        <button type="submit" className="flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors text-sm">
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
