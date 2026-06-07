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
    <div
      className="flex items-center gap-1 rounded-2xl px-1"
      style={{ background: 'var(--color-surface-raised)' }}
    >
      <button
        onClick={prev}
        className="p-2 rounded-xl transition-colors"
        style={{ color: 'var(--color-muted)' }}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold min-w-[84px] text-center">
        {MONTHS[month - 1]} {year}
      </span>
      <button
        onClick={next}
        className="p-2 rounded-xl transition-colors"
        style={{ color: 'var(--color-muted)' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
