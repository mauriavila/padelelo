import { getIncomeForMonth } from '@/lib/supabase/queries'
import IncomeRow from '@/components/income/IncomeRow'
import IncomePageClient from './IncomePageClient'

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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ingresos</h1>
      {incomeList.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">Sin ingresos en {month}</p>
      ) : (
        <div>
          {incomeList.map(i => <IncomeRow key={i.id} income={i} />)}
        </div>
      )}
      <IncomePageClient />
    </div>
  )
}
