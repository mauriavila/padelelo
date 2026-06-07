import { getIncomeForMonth } from '@/lib/supabase/queries'
import { formatARS } from '@/lib/currency'
import IncomeRow from '@/components/income/IncomeRow'
import IncomePageClient from './IncomePageClient'
import { TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()
  const incomeList = await getIncomeForMonth(month)
  const total = incomeList.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="max-w-[430px] mx-auto">
      <IncomePageClient month={month}>
        {/* Summary card */}
        <section className="px-6 pb-4">
          <div className="rounded-3xl p-5 ring-1 ring-white/[0.05]" style={{ background: 'var(--color-surface)' }}>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Total del mes
            </p>
            <p className="mt-1 text-4xl font-display font-bold tracking-tight" style={{ color: 'var(--color-income)' }}>
              +{formatARS(total)}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (incomeList.length / 5) * 100)}%`,
                    background: 'var(--color-income)',
                    boxShadow: '0 0 8px rgba(52,211,153,0.5)',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>
                {incomeList.length} fuentes
              </span>
            </div>
          </div>
        </section>

        {/* List */}
        {incomeList.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--color-surface)' }}
            >
              <TrendingUp size={24} style={{ color: 'var(--color-muted)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Sin ingresos este mes</p>
          </div>
        ) : (
          <section className="px-6">
            <div className="overflow-hidden rounded-3xl ring-1 ring-white/[0.05]" style={{ background: 'var(--color-surface)' }}>
              {incomeList.map((inc, i) => (
                <div
                  key={inc.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <IncomeRow income={inc} />
                </div>
              ))}
            </div>
          </section>
        )}
      </IncomePageClient>
    </div>
  )
}
