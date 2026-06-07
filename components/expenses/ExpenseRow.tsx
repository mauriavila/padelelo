import type { Expense, Card } from '@/lib/types'
import { formatARS } from '@/lib/currency'
import { Pencil, UtensilsCrossed, Car, Clapperboard, Pill, Shirt, Home, Package } from 'lucide-react'

const CATEGORY_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  food:          { icon: UtensilsCrossed, color: '#f97316' },
  transport:     { icon: Car,             color: '#3b82f6' },
  entertainment: { icon: Clapperboard,    color: '#a855f7' },
  health:        { icon: Pill,            color: '#ef4444' },
  clothing:      { icon: Shirt,           color: '#ec4899' },
  home:          { icon: Home,            color: '#eab308' },
  other:         { icon: Package,         color: '#7a7a8e' },
}

interface ExpenseRowProps {
  expense: Expense & { card?: Card | null }
  onEdit?: (expense: Expense) => void
}

export default function ExpenseRow({ expense, onEdit }: ExpenseRowProps) {
  const cat = CATEGORY_MAP[expense.category] ?? CATEGORY_MAP.other
  const Icon = cat.icon

  return (
    <div className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02]">
      <div
        className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{
          background: `${cat.color}1a`,
          boxShadow: `inset 0 0 0 1px ${cat.color}33`,
        }}
      >
        <Icon size={20} color={cat.color} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{expense.description ?? expense.category}</p>
        <p className="text-[11px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
          {expense.expense_date}
          {expense.card && (
            <span style={{ color: expense.card.color }}> · {expense.card.name}</span>
          )}
          {expense.installments_count > 1 && (
            <span> · {expense.installments_count} cuotas</span>
          )}
          {expense.is_shared && (
            <span style={{ color: 'var(--color-accent-light)' }}> · Compartido</span>
          )}
        </p>
      </div>

      <span className="text-sm font-display font-semibold flex-shrink-0" style={{ color: 'var(--color-expense)' }}>
        −{formatARS(expense.total_amount)}
      </span>

      {onEdit && (
        <button
          onClick={() => onEdit(expense)}
          className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100 hover:bg-white/5"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Editar gasto"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  )
}
