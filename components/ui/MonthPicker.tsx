'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number)

  function prev() {
    let m = month - 1, y = year
    if (m < 1) { m = 12; y -= 1 }
    onChange(`${y}-${String(m).padStart(2, '0')}`)
  }

  function next() {
    let m = month + 1, y = year
    if (m > 12) { m = 1; y += 1 }
    onChange(`${y}-${String(m).padStart(2, '0')}`)
  }

  return (
    <div className="flex items-center gap-4">
      <button onClick={prev} className="p-2 rounded-full hover:bg-[var(--color-surface-raised)]">
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold min-w-[120px] text-center">
        {MONTHS[month - 1]} {year}
      </span>
      <button onClick={next} className="p-2 rounded-full hover:bg-[var(--color-surface-raised)]">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
