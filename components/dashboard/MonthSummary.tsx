import { formatARS } from '@/lib/currency'
import { ArrowDownRight, ArrowUpRight, CreditCard } from 'lucide-react'

interface MonthSummaryProps {
  totalExpenses: number
  totalInstallments: number
  totalIncome: number
}

export default function MonthSummary({ totalExpenses, totalInstallments, totalIncome }: MonthSummaryProps) {
  const totalOut = totalExpenses + totalInstallments
  const balance = totalIncome - totalOut
  const isPositive = balance >= 0

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Hero balance card */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isPositive
              ? 'radial-gradient(ellipse at top right, rgba(52,211,153,0.08) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at top right, rgba(248,113,113,0.08) 0%, transparent 70%)',
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Balance del mes
        </p>
        <p
          className="text-[2.6rem] font-bold tracking-tight leading-none mb-2"
          style={{ color: isPositive ? 'var(--color-income)' : 'var(--color-expense)' }}
        >
          {isPositive ? '' : '−'}{formatARS(Math.abs(balance))}
        </p>
        <div
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: isPositive ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            color: isPositive ? 'var(--color-income)' : 'var(--color-expense)',
          }}
        >
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {isPositive ? 'Mes positivo' : 'Mes negativo'}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
            Gastos
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--color-expense)' }}>
            {formatARS(totalExpenses)}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
            Cuotas
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--color-card)' }}>
            {formatARS(totalInstallments)}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
            Ingresos
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--color-income)' }}>
            {formatARS(totalIncome)}
          </p>
        </div>
      </div>
    </div>
  )
}
