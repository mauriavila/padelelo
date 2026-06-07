import type { Card } from '@/lib/types'
import { CreditCard } from 'lucide-react'

export default function CardChip({ card }: { card: Card }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 rounded-2xl"
      style={{ background: 'var(--color-surface)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: card.color + '22' }}
      >
        <CreditCard size={18} color={card.color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{card.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {card.bank ? `${card.bank} · ` : ''}Cierra el {card.closing_day}
        </p>
      </div>
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: card.color }}
      />
    </div>
  )
}
