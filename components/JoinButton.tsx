'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Match, MatchPlayer, Profile } from '@/lib/types'

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

  useEffect(() => {
    supabase
      .from('match_players')
      .select('*, player:profiles(*)')
      .eq('match_id', match.id)
      .then(({ data }) => {
        if (data) setPlayers(data as MatchPlayerWithProfile[])
      })

    const channel = supabase
      .channel(`match-${match.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_players',
        filter: `match_id=eq.${match.id}`,
      }, () => {
        supabase
          .from('match_players')
          .select('*, player:profiles(*)')
          .eq('match_id', match.id)
          .then(({ data }) => {
            if (data) setPlayers(data as MatchPlayerWithProfile[])
          })

        supabase
          .from('matches')
          .select('*')
          .eq('id', match.id)
          .single()
          .then(({ data }) => {
            if (data) setMatch(data as Match)
          })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match.id])

  async function handleJoin() {
    setLoading(true)
    await supabase
      .from('match_players')
      .insert({ match_id: match.id, player_id: currentUserId })
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    await supabase
      .from('match_players')
      .delete()
      .eq('match_id', match.id)
      .eq('player_id', currentUserId)
    setLoading(false)
  }

  const spotsLeft = match.spots_total - match.spots_taken

  return (
    <div>
      <div className="mb-4">
        <p className="text-brand-muted text-xs uppercase tracking-wide mb-2">
          Jugadores ({match.spots_taken}/{match.spots_total})
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: match.spots_total }).map((_, i) => {
            const p = players[i]
            return (
              <div
                key={i}
                className={`rounded-xl p-3 border text-sm
                  ${p ? 'bg-brand-card border-brand-navy' : 'border-dashed border-brand-navy bg-transparent'}`}
              >
                {p ? (
                  <div>
                    <p className="text-white font-semibold truncate">
                      {p.player?.username ?? 'Jugador'}
                    </p>
                    <p className="text-brand-muted text-xs">Div {p.player?.division ?? '?'}</p>
                  </div>
                ) : (
                  <p className="text-brand-muted">Lugar libre</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {!isCreator && (
        <>
          {isJoined ? (
            <button
              onClick={handleLeave}
              disabled={loading}
              className="w-full border border-brand-red text-brand-red font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-brand-red/10 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saliendo...' : 'SALIR DE LA PARTIDA'}
            </button>
          ) : isFull ? (
            <button disabled className="w-full bg-gray-800 text-gray-500 font-bold py-4 rounded-xl uppercase tracking-wider cursor-not-allowed">
              PARTIDA LLENA
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-brand-red text-white font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Uniéndose...' : `UNIRSE · ${spotsLeft} ${spotsLeft === 1 ? 'LUGAR' : 'LUGARES'}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
