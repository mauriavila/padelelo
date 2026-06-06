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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gastos</h1>
        <MonthPicker
          value={month}
          onChange={m => router.push(`/dashboard?month=${m}`)}
        />
      </div>
      {children}
    </div>
  )
}
