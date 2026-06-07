import { getExpensesForMonth, getInstallmentsForMonth, getIncomeForMonth } from '@/lib/supabase/queries'
import { formatARS } from '@/lib/currency'
import MonthSummary from '@/components/dashboard/MonthSummary'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()

  const [expenses, installments, income] = await Promise.all([
    getExpensesForMonth(month),
    getInstallmentsForMonth(month),
    getIncomeForMonth(month),
  ])

  const totalExpenses = expenses.reduce((sum, e) => sum + e.total_amount, 0)
  const totalInstallments = installments.reduce((sum, i) => sum + i.amount, 0)
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)

  return (
    <DashboardClient month={month}>
      <MonthSummary
        totalExpenses={totalExpenses}
        totalInstallments={totalInstallments}
        totalIncome={totalIncome}
      />
      {installments.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
            Cuotas del mes ({installments.length})
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
            {installments.map((inst, i) => (
              <div
                key={inst.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderTop: i > 0 ? `1px solid var(--color-border)` : 'none',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: inst.status === 'paid' ? 'var(--color-income)' : 'var(--color-card)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inst.expense.description ?? inst.expense.category}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Cuota {inst.installment_number}/{inst.expense.installments_count}
                  </p>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-card)' }}>
                  −{formatARS(inst.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardClient>
  )
}
