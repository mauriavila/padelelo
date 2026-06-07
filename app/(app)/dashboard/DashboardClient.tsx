'use client'
import { useRouter } from 'next/navigation'
import MonthPicker from '@/components/ui/MonthPicker'

interface Props {
  month: string
  userInitials?: string
  children: React.ReactNode
}

export default function DashboardClient({ month, userInitials, children }: Props) {
  const router = useRouter()

  return (
    <div className="max-w-[430px] mx-auto px-6">
      <div className="flex items-end justify-between pt-8 pb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Resumen de
          </p>
          <MonthPicker
            value={month}
            onChange={m => router.push(`/dashboard?month=${m}`)}
          />
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-display font-semibold overflow-hidden ring-1 ring-white/10"
          style={{ background: 'linear-gradient(135deg, rgba(124,109,245,0.4), transparent)' }}
        >
          {userInitials ?? 'MA'}
        </div>
      </div>
      {children}
    </div>
  )
}
