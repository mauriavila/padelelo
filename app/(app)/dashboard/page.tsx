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
        <div>
          <h2 className="font-semibold mb-3 text-sm text-[var(--color-muted)]">
            Cuotas de tarjeta ({installments.length})
          </h2>
          <div className="bg-[var(--color-surface)] rounded-2xl divide-y divide-[var(--color-border)]">
            {installments.map(inst => (
              <div key={inst.id} className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full ${inst.status === 'paid' ? 'bg-[var(--color-income)]' : 'bg-[var(--color-card)]'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{inst.expense.description ?? inst.expense.category}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Cuota {inst.installment_number}/{inst.expense.installments_count}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-card)]">
                  -{formatARS(inst.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardClient>
  )
}
