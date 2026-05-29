import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DivisionBadge from '@/components/DivisionBadge'

interface Props { params: Promise<{ id: string }> }

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) return notFound()

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="bg-brand-card border border-brand-navy rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center text-2xl font-black text-white">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{profile.username}</p>
            <DivisionBadge division={profile.division} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-brand-red">{profile.elo}</p>
            <p className="text-brand-muted text-xs">ELO</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-white">{profile.wins}</p>
            <p className="text-brand-muted text-xs">Victorias</p>
          </div>
          <div className="bg-brand-dark rounded-xl p-3">
            <p className="text-2xl font-black text-white">{profile.losses}</p>
            <p className="text-brand-muted text-xs">Derrotas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
