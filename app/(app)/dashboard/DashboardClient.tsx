'use client'
import { useRouter } from 'next/navigation'
import MonthPicker from '@/components/ui/MonthPicker'

interface Props {
  month: string
  children: React.ReactNode
}

export default function DashboardClient({ month, children }: Props) {
  const router = useRouter()

  return (
    <div className="max-w-[430px] mx-auto px-4">
      <div className="flex items-end justify-between pt-8 pb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Resumen de
          </p>
          <h1 className="text-2xl font-display font-bold tracking-tight">Gastos</h1>
        </div>
        <MonthPicker
          value={month}
          onChange={m => router.push(`/dashboard?month=${m}`)}
        />
      </div>
      {children}
    </div>
  )
}
