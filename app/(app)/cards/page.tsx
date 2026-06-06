import { getCards } from '@/lib/supabase/queries'
import CardChip from '@/components/cards/CardChip'
import CardsClient from './CardsClient'

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tarjetas</h1>
      {cards.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No tenés tarjetas cargadas aún.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map(card => <CardChip key={card.id} card={card} />)}
        </div>
      )}
      <CardsClient />
    </div>
  )
}
