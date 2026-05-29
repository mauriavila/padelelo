export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Share2 } from 'lucide-react'
import { Match } from '@/lib/types'
import DivisionBadge from '@/components/DivisionBadge'
import JoinButton from '@/components/JoinButton'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ code?: string }>
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
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

  if (!match.is_public && match.creator_id !== user.id && (!code || code !== match.invite_code)) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-white font-bold text-xl mb-2">Partida privada</p>
        <p className="text-white/40 text-sm">Necesitás el link de invitación para unirte.</p>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const shareUrl = match.is_public
    ? `${siteUrl}/partidas/${id}`
    : `${siteUrl}/partidas/${id}?code=${match.invite_code}`

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5 mb-5">
        <div className="flex items-start gap-2 mb-1">
          <MapPin size={15} className="text-brand-muted mt-0.5 shrink-0" />
          <h1 className="text-white font-black text-lg leading-tight">{match.location}</h1>
        </div>
        <div className="flex items-center gap-1.5 ml-5 mb-4">
          <Clock size={13} className="text-white/30" />
          <p className="text-white/40 text-sm capitalize">{formatFullDate(match.scheduled_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {match.division
            ? <DivisionBadge division={match.division} />
            : <span className="text-white/40 text-sm">Cualquier nivel</span>}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium
            ${match.is_public ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'}`}>
            {match.is_public ? '🌐 Pública' : '🔒 Privada'}
          </span>
        </div>
      </div>

      <JoinButton match={match as Match} currentUserId={user.id} />

      <div className="mt-5 card-elevated bg-brand-card border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={15} className="text-white/40" />
          <p className="text-white/40 text-xs uppercase tracking-widest">Compartir</p>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent(`¡Sumate a mi partida de pádel! ${shareUrl}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 hover:bg-green-500/15 transition-colors">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-green-400 text-sm font-semibold">Invitar por WhatsApp</p>
            <p className="text-white/30 text-xs">Compartí el link con tus amigos</p>
          </div>
        </a>
      </div>
    </div>
  )
}
