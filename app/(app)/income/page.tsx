import { getIncomeForMonth } from '@/lib/supabase/queries'
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

  return (
    <div className="max-w-[430px] mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-5">Ingresos</h1>
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
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--color-surface)' }}>
          {incomeList.map((inc, i) => (
            <div
              key={inc.id}
              style={{ borderTop: i > 0 ? `1px solid var(--color-border)` : 'none' }}
            >
              <IncomeRow income={inc} />
            </div>
          ))}
        </div>
      )}
      <IncomePageClient />
    </div>
  )
}
