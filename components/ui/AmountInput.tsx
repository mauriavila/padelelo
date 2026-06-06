'use client'
import { useRef, useEffect } from 'react'
import { formatARS } from '@/lib/currency'

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  autoFocus?: boolean
}

export default function AmountInput({ value, onChange, autoFocus }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw ? parseInt(raw, 10) : 0)
  }

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <span className="text-[var(--color-muted)] text-sm">Monto</span>
      <div className="relative flex items-center">
        <span className="text-4xl font-bold text-[var(--color-muted)] mr-1">$</span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={value > 0 ? value.toString() : ''}
          onChange={handleChange}
          placeholder="0"
          className="text-5xl font-bold bg-transparent border-none outline-none w-48 text-center"
        />
      </div>
      {value > 0 && (
        <span className="text-[var(--color-muted)] text-sm">{formatARS(value)}</span>
      )}
    </div>
  )
}
