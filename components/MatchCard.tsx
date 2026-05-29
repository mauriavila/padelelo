import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { Match } from '@/lib/types'
import DivisionBadge from './DivisionBadge'

interface Props { match: Match }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function MatchCard({ match }: Props) {
  const spotsLeft = match.spots_total - match.spots_taken
  const isFull = match.status === 'full'

  return (
    <Link href={`/partidas/${match.id}`}>
      <div className={`card-elevated card-hover bg-brand-card border rounded-2xl p-4 mb-3
        ${isFull ? 'border-white/5 opacity-50' : 'border-white/8'}`}>

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-brand-muted shrink-0" />
              <p className="text-white font-semibold text-sm truncate">{match.location}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-brand-muted shrink-0" />
              <p className="text-brand-muted text-xs">
                {formatDate(match.scheduled_at)} · {formatTime(match.scheduled_at)}
              </p>
            </div>
          </div>

          {isFull ? (
            <span className="text-xs bg-white/5 text-white/30 px-2.5 py-1 rounded-full font-medium shrink-0">
              LLENO
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #e94560, #ff6b35)' }}>
              {spotsLeft} {spotsLeft === 1 ? 'lugar' : 'lugares'}
            </span>
          )}
        </div>

        <div className="h-px bg-white/5 mb-3" />

        <div className="flex items-center justify-between">
          {match.division ? (
            <DivisionBadge division={match.division} size="sm" />
          ) : (
            <span className="text-xs text-brand-muted">Cualquier nivel</span>
          )}
          {match.creator && (
            <span className="text-xs text-white/30">por {match.creator.username}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
