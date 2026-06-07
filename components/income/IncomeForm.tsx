'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import { formatARS } from '@/lib/currency'
import { Repeat2, Briefcase, Tag, Inbox } from 'lucide-react'

const INCOME_CATEGORIES = [
  { key: 'salary',        label: 'Sueldo',     Icon: Briefcase, color: '#34d399' },
  { key: 'sale',          label: 'Venta',       Icon: Tag,       color: '#60a5fa' },
  { key: 'reimbursement', label: 'Reembolso',   Icon: Repeat2,   color: '#a78bfa' },
  { key: 'other',         label: 'Otro',        Icon: Inbox,     color: '#7a7a8e' },
] as const

export default function IncomeForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [rawAmount, setRawAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('salary')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)

  const amount = parseInt(rawAmount.replace(/\D/g, '') || '0', 10)

  function reset() {
    setRawAmount(''); setDescription(''); setCategory('salary'); setDate(today)
  }

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
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo ingreso">
      <div className="flex flex-col gap-6">

        <Field label="Monto">
          <div
            className="flex items-baseline gap-2 rounded-2xl px-4 py-4 ring-1 ring-white/[0.04] focus-within:ring-[var(--color-income)]/60"
            style={{ background: 'var(--color-surface-raised)' }}
          >
            <span className="text-2xl font-display" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              inputMode="numeric"
              placeholder="0"
              value={rawAmount}
              onChange={e => setRawAmount(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="w-full bg-transparent text-3xl font-display font-bold tracking-tight outline-none placeholder:text-[var(--color-muted)]/40"
              style={{ color: 'var(--color-income)' }}
            />
          </div>
          {amount > 0 && (
            <p className="text-xs font-mono mt-1 text-center" style={{ color: 'var(--color-muted)' }}>
              {formatARS(amount)}
            </p>
          )}
        </Field>

        <Field label="Descripción">
          <input
            placeholder="Opcional"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-white/[0.04] placeholder:text-[var(--color-muted)]/60 focus:ring-[var(--color-accent)]/60"
            style={{ background: 'var(--color-surface-raised)' }}
          />
        </Field>

        <Field label="Categoría">
          <div className="grid grid-cols-2 gap-2">
            {INCOME_CATEGORIES.map(({ key, label, Icon, color }) => {
              const active = category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3 ring-1 transition-all"
                  style={{
                    background: active ? `${color}20` : 'var(--color-surface-raised)',
                    boxShadow: active ? `inset 0 0 0 1px ${color}80` : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} style={{ color: active ? color : 'var(--color-muted)', flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ color: active ? color : 'var(--color-muted)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Fecha">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-white/[0.04]"
            style={{ background: 'var(--color-surface-raised)', colorScheme: 'dark' }}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => { onClose(); reset() }}
            className="flex-1 rounded-2xl py-3.5 text-sm font-medium transition-colors"
            style={{ background: 'var(--color-surface-raised)', color: 'var(--color-muted)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={amount <= 0 || saving}
            className="flex-[2] rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{
              background: 'var(--color-income)',
              color: '#000',
              boxShadow: '0 8px 24px rgba(52,211,153,0.35)',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar ingreso'}
          </button>
        </div>

      </div>
    </BottomSheet>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      {children}
    </div>
  )
}
