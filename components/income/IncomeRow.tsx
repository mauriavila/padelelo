import type { Income } from '@/lib/types'
import { formatARS } from '@/lib/currency'
import { RotateCcw, Wallet, Tag, ArrowDownLeft } from 'lucide-react'

const INCOME_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  reimbursement: { icon: RotateCcw,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  salary:        { icon: Wallet,         color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  sale:          { icon: Tag,            color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  other:         { icon: ArrowDownLeft,  color: '#7a7a8e', bg: 'rgba(122,122,142,0.12)' },
}

export default function IncomeRow({ income }: { income: Income }) {
  const cat = INCOME_MAP[income.category] ?? INCOME_MAP.other
  const Icon = cat.icon

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: cat.bg }}
      >
        <Icon size={18} color={cat.color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{income.description ?? income.category}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{income.income_date}</p>
      </div>
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-income)' }}>
        +{formatARS(income.amount)}
      </span>
    </div>
  )
}
