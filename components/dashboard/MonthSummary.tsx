import { formatARS } from '@/lib/currency'

interface MonthSummaryProps {
  totalExpenses: number
  totalInstallments: number
  totalIncome: number
}

export default function MonthSummary({ totalExpenses, totalInstallments, totalIncome }: MonthSummaryProps) {
  const totalOut = totalExpenses + totalInstallments
  const balance = totalIncome - totalOut

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 col-span-2">
        <p className="text-[var(--color-muted)] text-xs mb-1">Balance del mes</p>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
          {formatARS(Math.abs(balance))}
          <span className="text-sm ml-1">{balance >= 0 ? '↑ positivo' : '↓ negativo'}</span>
        </p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4">
        <p className="text-[var(--color-muted)] text-xs mb-1">Egresos propios</p>
        <p className="text-xl font-bold text-[var(--color-expense)]">-{formatARS(totalExpenses)}</p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4">
        <p className="text-[var(--color-muted)] text-xs mb-1">Cuotas del mes</p>
        <p className="text-xl font-bold text-[var(--color-card)]">-{formatARS(totalInstallments)}</p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 col-span-2">
        <p className="text-[var(--color-muted)] text-xs mb-1">Ingresos</p>
        <p className="text-xl font-bold text-[var(--color-income)]">+{formatARS(totalIncome)}</p>
      </div>
    </div>
  )
}
