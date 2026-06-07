import type { Expense, Card } from '@/lib/types'
import { formatARS } from '@/lib/currency'
import { Pencil, UtensilsCrossed, Car, Clapperboard, Pill, Shirt, Home, Package } from 'lucide-react'

const CATEGORY_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  food:          { icon: UtensilsCrossed, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  transport:     { icon: Car,             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  entertainment: { icon: Clapperboard,    color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  health:        { icon: Pill,            color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  clothing:      { icon: Shirt,           color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  home:          { icon: Home,            color: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  other:         { icon: Package,         color: '#7a7a8e', bg: 'rgba(122,122,142,0.12)'},
}

interface ExpenseRowProps {
  expense: Expense & { card?: Card | null }
  onEdit?: (expense: Expense) => void
}

export default function ExpenseRow({ expense, onEdit }: ExpenseRowProps) {
  const cat = CATEGORY_MAP[expense.category] ?? CATEGORY_MAP.other
  const Icon = cat.icon

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: cat.bg }}
      >
        <Icon size={18} color={cat.color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{expense.description ?? expense.category}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
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
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-expense)' }}>
        −{formatARS(expense.total_amount)}
      </span>
      {onEdit && (
        <button
          onClick={() => onEdit(expense)}
          className="p-2 -mr-1 rounded-xl transition-colors"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Editar gasto"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
  )
}
