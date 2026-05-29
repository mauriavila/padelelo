import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Match } from '@/lib/types'
import DivisionBadge from '@/components/DivisionBadge'
import JoinButton from '@/components/JoinButton'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ code?: string }>
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function MatchDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { code } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: match } = await supabase
    .from('matches')
    .select('*, creator:profiles(*)')
    .eq('id', id)
    .single()

  if (!match) return notFound()

  if (!match.is_public && match.creator_id !== user.id) {
    if (!code || code !== match.invite_code) {
      return (
        <div className="max-w-lg mx-auto px-4 pt-16 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-white font-bold text-lg">Partida privada</p>
          <p className="text-brand-muted text-sm mt-2">Necesitás el link de invitación para unirte.</p>
        </div>
      )
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const shareUrl = match.is_public
    ? `${siteUrl}/partidas/${id}`
    : `${siteUrl}/partidas/${id}?code=${match.invite_code}`

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-white font-bold text-xl mb-1">{match.location}</h1>
        <p className="text-brand-muted text-sm">{formatFullDate(match.scheduled_at)}</p>
        <div className="flex items-center gap-2 mt-3">
          {match.division ? (
            <DivisionBadge division={match.division} />
          ) : (
            <span className="text-brand-muted text-sm">Cualquier nivel</span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-semibold
            ${match.is_public ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
            {match.is_public ? '🌐 Pública' : '🔒 Privada'}
          </span>
        </div>
      </div>

      <JoinButton match={match as Match} currentUserId={user.id} />

      <div className="mt-6 p-4 bg-brand-card rounded-xl border border-brand-navy">
        <p className="text-brand-muted text-xs uppercase tracking-wide mb-2">Compartir por WhatsApp</p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`¡Sumate a mi partida de pádel! ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-400 text-sm font-semibold hover:text-green-300"
        >
          <span>💬</span>
          <span>Invitar por WhatsApp</span>
        </a>
      </div>
    </div>
  )
}
