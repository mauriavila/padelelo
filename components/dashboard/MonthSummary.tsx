import { formatARS, formatARSCompact } from '@/lib/currency'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

interface MonthSummaryProps {
  totalExpenses: number
  totalInstallments: number
  totalIncome: number
}

export default function MonthSummary({ totalExpenses, totalInstallments, totalIncome }: MonthSummaryProps) {
  const totalOut = totalExpenses + totalInstallments
  const balance = totalIncome - totalOut
  const positive = balance >= 0
  const used = Math.min(1, totalOut / Math.max(totalIncome, 1))
  const circumference = 2 * Math.PI * 110
  const offset = circumference - used * circumference * 0.75

  return (
    <div className="mb-6">
      {/* Gauge hero */}
      <section className="py-2 animate-slide-up">
        <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center">
          <svg viewBox="0 0 240 240" className="absolute inset-0" style={{ transform: 'rotate(-225deg)' }}>
            <circle cx="120" cy="120" r="110" stroke="rgba(255,255,255,0.04)" strokeWidth="12" fill="none" />
            <circle
              cx="120"
              cy="120"
              r="110"
              stroke={positive ? 'var(--color-income)' : 'var(--color-expense)'}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeDashoffset={offset - circumference * 0.25}
              style={{
                filter: `drop-shadow(0 0 12px ${positive ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'})`,
                transition: 'stroke-dashoffset 1s var(--ease-out-expo)',
              }}
            />
          </svg>

          <div className="relative z-10 text-center">
            <p
              className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{ color: positive ? 'var(--color-income)' : 'var(--color-expense)' }}
            >
              {positive ? 'Balance positivo' : 'Balance negativo'}
            </p>
            <p className="text-[2.75rem] font-display font-bold leading-none tracking-tighter">
              {formatARS(Math.abs(balance))}
            </p>
            <p className="mt-2 text-[11px] font-mono" style={{ color: 'var(--color-muted)' }}>
              ARS · este mes
            </p>
          </div>

          <div className="absolute bottom-2 flex w-full justify-between px-6">
            <GaugeMark color="var(--color-income)" label="IN" />
            <GaugeMark color="var(--color-accent)" label="HOY" glow />
            <GaugeMark color="var(--color-expense)" label="OUT" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <Stat label="Ingresos" value={`+${formatARSCompact(totalIncome)}`} color="var(--color-income)" Icon={ArrowDownRight} />
        <Stat label="Gastos" value={`−${formatARSCompact(totalExpenses)}`} color="var(--color-expense)" Icon={ArrowUpRight} />
        <Stat label="Cuotas" value={formatARSCompact(totalInstallments)} color="var(--color-card)" Icon={TrendingUp} />
      </section>
    </div>
  )
}

function GaugeMark({ color, label, glow }: { color: string; label: string; glow?: boolean }) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-1 w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: glow ? `0 0 8px ${color}` : undefined }}
      />
      <span className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--color-muted)' }}>{label}</span>
    </div>
  )
}

function Stat({
  label,
  value,
  color,
  Icon,
}: {
  label: string
  value: string
  color: string
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl p-3 ring-1 ring-white/[0.04]" style={{ background: 'var(--color-surface)' }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <Icon className="w-3 h-3" />
      </div>
      <p className="text-base font-display font-bold tracking-tight" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
