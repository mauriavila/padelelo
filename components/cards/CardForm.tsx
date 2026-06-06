'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'

const COLORS = ['#7c6df5','#f59e0b','#4ade80','#f87171','#60a5fa','#f472b6','#a78bfa']

interface CardFormProps {
  open: boolean
  onClose: () => void
}

export default function CardForm({ open, onClose }: CardFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [closingDay, setClosingDay] = useState(20)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bank: bank.trim() || null, color, closing_day: closingDay }),
      })
      router.refresh()
      onClose()
      setName(''); setBank(''); setColor(COLORS[0]); setClosingDay(20)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nueva tarjeta">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Nombre</span>
          <input
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            placeholder="VISA Banco Galicia"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Banco (opcional)</span>
          <input
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            placeholder="Galicia"
            value={bank}
            onChange={e => setBank(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--color-muted)]">Color</span>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: c,
                  transform: color === c ? 'scale(1.25)' : 'scale(1)',
                  outline: color === c ? '2px solid white' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Día de cierre</span>
          <input
            type="number"
            min={1}
            max={28}
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none w-24"
            value={closingDay}
            onChange={e => setClosingDay(Math.max(1, Math.min(28, parseInt(e.target.value) || 1)))}
          />
          <span className="text-xs text-[var(--color-muted)]">
            Gastos después del día {closingDay} van al mes siguiente
          </span>
        </label>

        <button
          onClick={save}
          disabled={!name.trim() || saving}
          className="w-full bg-[var(--color-accent)] text-white font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar tarjeta'}
        </button>
      </div>
    </BottomSheet>
  )
}
