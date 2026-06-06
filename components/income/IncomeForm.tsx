'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import AmountInput from '@/components/ui/AmountInput'

const INCOME_CATEGORIES = [
  { key: 'reimbursement', label: 'Reembolso', icon: '↩️' },
  { key: 'salary', label: 'Sueldo', icon: '💰' },
  { key: 'sale', label: 'Venta', icon: '🏷️' },
  { key: 'other', label: 'Otro', icon: '📥' },
] as const

export default function IncomeForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (amount <= 0) return
    setSaving(true)
    try {
      await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || null,
          amount,
          category,
          income_date: date,
        }),
      })
      router.refresh()
      onClose()
      setAmount(0); setDescription(''); setCategory('other'); setDate(today)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo ingreso">
      <div className="flex flex-col gap-5">
        <AmountInput value={amount} onChange={setAmount} autoFocus />

        <input
          className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Categoría</span>
          <div className="grid grid-cols-2 gap-2">
            {INCOME_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                  category === cat.key ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)]'
                }`}
              >
                <span>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Fecha</span>
          <input
            type="date"
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>

        <button
          onClick={save}
          disabled={amount <= 0 || saving}
          className="w-full bg-[var(--color-income)] text-black font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar ingreso'}
        </button>
      </div>
    </BottomSheet>
  )
}
