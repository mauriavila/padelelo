import type { Expense, Card } from '@/lib/types'
import { formatARS } from '@/lib/currency'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', transport: '🚗', entertainment: '🎬',
  health: '💊', clothing: '👕', home: '🏠', other: '📦',
}

interface ExpenseRowProps {
  expense: Expense & { card?: Card | null }
}

export default function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-raised)] flex items-center justify-center text-lg flex-shrink-0">
        {CATEGORY_ICONS[expense.category] ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{expense.description ?? expense.category}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {expense.expense_date}
          {expense.card && (
            <span style={{ color: expense.card.color }}> · {expense.card.name}</span>
          )}
          {expense.installments_count > 1 && (
            <span className="text-[var(--color-muted)]"> · {expense.installments_count} cuotas</span>
          )}
          {expense.is_shared && <span className="text-[var(--color-accent-light)]"> · Compartido</span>}
        </p>
      </div>
      <span className="font-semibold text-[var(--color-expense)]">
        -{formatARS(expense.total_amount)}
      </span>
    </div>
  )
}
