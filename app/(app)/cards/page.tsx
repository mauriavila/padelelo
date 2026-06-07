import { getCards } from '@/lib/supabase/queries'
import CardChip from '@/components/cards/CardChip'
import CardsClient from './CardsClient'
import { CreditCard } from 'lucide-react'

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="max-w-[430px] mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-5">Tarjetas</h1>
      {cards.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <CreditCard size={24} style={{ color: 'var(--color-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No tenés tarjetas cargadas aún</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Tocá + para agregar una</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {cards.map(card => <CardChip key={card.id} card={card} />)}
        </div>
      )}
      <CardsClient />
    </div>
  )
}
