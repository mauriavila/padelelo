'use client'

import { useState, useEffect } from 'react'
import { UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Match, MatchPlayer, Profile } from '@/lib/types'
import { getDivisionColor } from '@/lib/divisions'
import DivisionBadge from './DivisionBadge'

interface Props {
  match: Match
  currentUserId: string
}

type MatchPlayerWithProfile = MatchPlayer & { player: Profile | null }

export default function JoinButton({ match: initialMatch, currentUserId }: Props) {
  const supabase = createClient()
  const [match, setMatch] = useState(initialMatch)
  const [players, setPlayers] = useState<MatchPlayerWithProfile[]>([])
  const [loading, setLoading] = useState(false)

  const isJoined = players.some(p => p.player_id === currentUserId)
  const isFull = match.status === 'full'
  const isCreator = match.creator_id === currentUserId
  const spotsLeft = match.spots_total - match.spots_taken

  useEffect(() => {
    supabase
      .from('match_players')
      .select('*, player:profiles(*)')
      .eq('match_id', match.id)
      .then(({ data }) => { if (data) setPlayers(data as MatchPlayerWithProfile[]) })

    const channel = supabase
      .channel(`match-${match.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_players', filter: `match_id=eq.${match.id}` }, () => {
        supabase.from('match_players').select('*, player:profiles(*)').eq('match_id', match.id)
          .then(({ data }) => { if (data) setPlayers(data as MatchPlayerWithProfile[]) })
        supabase.from('matches').select('*').eq('id', match.id).single()
          .then(({ data }) => { if (data) setMatch(data as Match) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match.id])

  async function handleJoin() {
    setLoading(true)
    await supabase.from('match_players').insert({ match_id: match.id, player_id: currentUserId })
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    await supabase.from('match_players').delete().eq('match_id', match.id).eq('player_id', currentUserId)
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
          Jugadores · {match.spots_taken}/{match.spots_total}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: match.spots_total }).map((_, i) => {
            const p = players[i]
            const divColor = p?.player ? getDivisionColor(p.player.division) : null

            return p ? (
              <div key={i} className="bg-brand-card border border-white/8 rounded-2xl p-3.5 card-elevated">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}66)`, border: `1px solid ${divColor}40` }}
                  >
                    {p.player?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.player?.username ?? 'Jugador'}</p>
                    <DivisionBadge division={p.player?.division ?? 3} showName={false} size="sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="slot-pulse border border-dashed rounded-2xl p-3.5 flex items-center gap-2.5"
                style={{ borderColor: 'rgba(22,33,62,0.8)', background: 'rgba(18,18,31,0.4)' }}>
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-white/20" />
                </div>
                <p className="text-white/25 text-sm">Lugar libre</p>
              </div>
            )
          })}
        </div>
      </div>

      {!isCreator && (
        isJoined ? (
          <button onClick={handleLeave} disabled={loading}
            className="w-full border border-brand-red/60 text-brand-red font-bold py-4 rounded-2xl uppercase tracking-widest text-sm hover:bg-brand-red/5 transition-colors disabled:opacity-50">
            {loading ? 'Saliendo...' : 'Salir de la partida'}
          </button>
        ) : isFull ? (
          <button disabled
            className="w-full bg-white/5 text-white/20 font-bold py-4 rounded-2xl uppercase tracking-widest text-sm cursor-not-allowed">
            Partida completa
          </button>
        ) : (
          <button onClick={handleJoin} disabled={loading}
            className="btn-primary w-full text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}>
            {loading ? 'Uniéndose...' : `Unirse · ${spotsLeft} ${spotsLeft === 1 ? 'lugar libre' : 'lugares libres'}`}
          </button>
        )
      )}
    </div>
  )
}
