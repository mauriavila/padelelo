import type { Card } from '@/lib/types'

export default function CardChip({ card }: { card: Card }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
      style={{ background: card.color + '22', border: `1px solid ${card.color}44` }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: card.color }} />
      <span>{card.name}</span>
      {card.bank && <span className="text-[var(--color-muted)]">· {card.bank}</span>}
      <span className="text-[var(--color-muted)]">cierre {card.closing_day}</span>
    </div>
  )
}
