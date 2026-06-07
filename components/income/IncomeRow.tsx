import type { Income } from '@/lib/types'
import { formatARS } from '@/lib/currency'
import { RotateCcw, Wallet, Tag, ArrowDownLeft } from 'lucide-react'

const INCOME_MAP: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  reimbursement: { icon: RotateCcw,     color: '#3b82f6', label: 'Devolución' },
  salary:        { icon: Wallet,        color: '#34d399', label: 'Sueldo'     },
  sale:          { icon: Tag,           color: '#f97316', label: 'Venta'      },
  other:         { icon: ArrowDownLeft, color: '#7a7a8e', label: 'Otros'      },
}

export default function IncomeRow({ income }: { income: Income }) {
  const cat = INCOME_MAP[income.category] ?? INCOME_MAP.other
  const Icon = cat.icon

  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div
        className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{
          background: `${cat.color}1a`,
          boxShadow: `inset 0 0 0 1px ${cat.color}33`,
        }}
      >
        <Icon size={20} color={cat.color} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{income.description ?? income.category}</p>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {income.income_date} · {cat.label}
        </p>
      </div>
      <span className="text-sm font-display font-semibold flex-shrink-0" style={{ color: 'var(--color-income)' }}>
        +{formatARS(income.amount)}
      </span>
    </div>
  )
}
