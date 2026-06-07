import type { Card } from '@/lib/types'
import { CreditCard, MoreHorizontal } from 'lucide-react'

export default function CardChip({ card }: { card: Card }) {
  return (
    <article
      className="relative overflow-hidden rounded-3xl p-5 ring-1 ring-white/[0.06]"
      style={{
        background: `linear-gradient(135deg, ${card.color}40 0%, ${card.color}10 50%, var(--color-surface) 100%)`,
        aspectRatio: '1.7 / 1',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(circle at 80% 0%, ${card.color}, transparent 60%)` }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl ring-1 ring-white/10"
              style={{ background: `${card.color}30` }}
            >
              <CreditCard size={20} color={card.color} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-display font-semibold">{card.name}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                {card.bank ?? 'Tarjeta'}
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Opciones"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Cierre
            </p>
            <p className="font-display font-semibold text-sm">
              {String(card.closing_day).padStart(2, '0')}
            </p>
          </div>
          {card.due_day != null && (
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Vence
              </p>
              <p className="font-display font-semibold text-sm">
                {String(card.due_day).padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
