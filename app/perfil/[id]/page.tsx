export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DivisionBadge from '@/components/DivisionBadge'
import { getDivisionColor } from '@/lib/divisions'

interface Props { params: Promise<{ id: string }> }

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) return notFound()

  const divColor = getDivisionColor(profile.division)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}55)`, border: `2px solid ${divColor}50` }}>
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight mb-1">{profile.username}</p>
            <DivisionBadge division={profile.division} size="md" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'ELO', value: profile.elo, gradient: true },
            { label: 'Victorias', value: profile.wins, gradient: false },
            { label: 'Derrotas', value: profile.losses, gradient: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, rgba(18,18,31,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className={`text-2xl font-black mb-0.5 ${stat.gradient ? 'gradient-text' : 'text-white'}`}>{stat.value}</p>
              <p className="text-white/30 text-xs uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
