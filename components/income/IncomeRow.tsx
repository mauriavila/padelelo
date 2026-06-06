import type { Income } from '@/lib/types'
import { formatARS } from '@/lib/currency'

const INCOME_ICONS: Record<string, string> = {
  reimbursement: '↩️', salary: '💰', sale: '🏷️', other: '📥',
}

export default function IncomeRow({ income }: { income: Income }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-raised)] flex items-center justify-center text-lg">
        {INCOME_ICONS[income.category] ?? '📥'}
      </div>
      <div className="flex-1">
        <p className="font-medium">{income.description ?? income.category}</p>
        <p className="text-xs text-[var(--color-muted)]">{income.income_date}</p>
      </div>
      <span className="font-semibold text-[var(--color-income)]">+{formatARS(income.amount)}</span>
    </div>
  )
}
