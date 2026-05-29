import Link from 'next/link'
import { Match } from '@/lib/types'
import DivisionBadge from './DivisionBadge'

interface Props {
  match: Match
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function MatchCard({ match }: Props) {
  const spotsLeft = match.spots_total - match.spots_taken
  const isFull = match.status === 'full'

  return (
    <Link href={`/partidas/${match.id}`}>
      <div className={`bg-brand-card border rounded-xl p-4 mb-3 hover:border-brand-red transition-colors
        ${isFull ? 'border-gray-800 opacity-60' : 'border-brand-navy'}`}>

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-white font-semibold text-sm">{match.location}</p>
            <p className="text-brand-muted text-xs mt-0.5">
              {formatDate(match.scheduled_at)} · {formatTime(match.scheduled_at)}
            </p>
          </div>
          {isFull ? (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">LLENO</span>
          ) : (
            <span className="text-xs bg-brand-red/10 text-brand-red px-2 py-1 rounded-full font-semibold">
              {spotsLeft} {spotsLeft === 1 ? 'lugar' : 'lugares'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {match.division ? (
            <DivisionBadge division={match.division} size="sm" />
          ) : (
            <span className="text-xs text-brand-muted">Cualquier nivel</span>
          )}
          {match.creator && (
            <span className="text-xs text-brand-muted">por {match.creator.username}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
