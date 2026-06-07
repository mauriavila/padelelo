import { getExpensesForMonth, getInstallmentsForMonth, getIncomeForMonth } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''
  const userInitials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'MA'

  const [expenses, installments, income] = await Promise.all([
    getExpensesForMonth(month),
    getInstallmentsForMonth(month),
    getIncomeForMonth(month),
  ])

  const totalExpenses = expenses.reduce((sum, e) => sum + e.total_amount, 0)
  const totalInstallments = installments.reduce((sum, i) => sum + i.amount, 0)
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)

  return (
    <DashboardClient month={month} userInitials={userInitials}>
      <MonthSummary
        totalExpenses={totalExpenses}
        totalInstallments={totalInstallments}
        totalIncome={totalIncome}
      />
      {installments.length > 0 && (
        <section className="mt-8 animate-slide-up" style={{ animationDelay: '160ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--color-muted)' }}>
              Cuotas del mes
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-mono ring-1"
              style={{
                background: 'var(--color-accent-dim)',
                color: 'var(--color-accent-light)',
                borderColor: 'rgba(124,109,245,0.2)',
              }}
            >
              {installments.filter(i => i.status === 'pending').length} pendientes
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl ring-1 ring-white/[0.05]">
            {installments.map((inst, i) => (
              <div
                key={inst.id}
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background: 'var(--color-surface)',
                  borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: inst.status === 'paid' ? 'var(--color-income)' : 'var(--color-card)',
                      boxShadow: inst.status === 'paid'
                        ? '0 0 8px rgba(52,211,153,0.6)'
                        : '0 0 8px rgba(251,191,36,0.5)',
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inst.expense.description ?? inst.expense.category}</p>
                    <p className="text-[11px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                      Cuota {String(inst.installment_number).padStart(2,'0')}/{String(inst.expense.installments_count).padStart(2,'0')}
                      {(inst.expense as typeof inst.expense & { card?: { name: string } | null }).card?.name
                        ? ` · ${(inst.expense as typeof inst.expense & { card?: { name: string } | null }).card!.name}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="pl-3 text-right">
                  <p className="text-sm font-display font-bold">−{formatARS(inst.amount)}</p>
                  <p
                    className="text-[10px] font-mono"
                    style={{ color: inst.status === 'paid' ? 'var(--color-income)' : 'var(--color-muted)' }}
                  >
                    {inst.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardClient>
  )
}
