'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import IncomeForm from '@/components/income/IncomeForm'
import MonthPicker from '@/components/ui/MonthPicker'

interface Props {
  month: string
  children: React.ReactNode
}

export default function IncomePageClient({ month, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-end justify-between px-4 pt-8 pb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Tus
          </p>
          <h1 className="text-2xl font-display font-bold tracking-tight">Ingresos</h1>
        </div>
        <MonthPicker
          value={month}
          onChange={m => router.push(`/income?month=${m}`)}
        />
      </div>
      {children}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 z-30 w-14 h-14 flex items-center justify-center rounded-2xl shadow-[0_10px_32px_rgba(52,211,153,0.35)] ring-4 ring-background transition-transform active:scale-90"
        style={{
          bottom: 'calc(var(--nav-height) + var(--sai-bottom) + 1rem)',
          background: 'var(--color-income)',
          color: '#000',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
      <IncomeForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
