'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import type { Card, Expense } from '@/lib/types'
import { formatARS } from '@/lib/currency'
import {
  UtensilsCrossed, Car, Clapperboard, Pill, Shirt, Home, Package,
} from 'lucide-react'

const CATEGORIES = [
  { key: 'food',          label: 'Comida',     Icon: UtensilsCrossed, color: '#f97316' },
  { key: 'transport',     label: 'Transporte',  Icon: Car,             color: '#3b82f6' },
  { key: 'entertainment', label: 'Ocio',        Icon: Clapperboard,    color: '#a855f7' },
  { key: 'health',        label: 'Salud',       Icon: Pill,            color: '#ef4444' },
  { key: 'clothing',      label: 'Ropa',        Icon: Shirt,           color: '#ec4899' },
  { key: 'home',          label: 'Hogar',       Icon: Home,            color: '#eab308' },
  { key: 'other',         label: 'Otros',       Icon: Package,         color: '#7a7a8e' },
] as const

const INSTALLMENT_OPTIONS = [1, 3, 6, 9, 12, 18, 24]

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  cards: Card[]
  groupMembers: Array<{ user_id: string; display_name: string }>
  currentUserId: string
  groupId?: number | null
  editingExpense?: Expense | null
}

function getInitialBillingMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function prevMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function nextMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function fmtBillingMonth(ym: string) {
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const [y, m] = ym.split('-')
  return `${months[parseInt(m) - 1]} ${y}`
}

export default function ExpenseForm({ open, onClose, cards, groupMembers, currentUserId, groupId, editingExpense }: ExpenseFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [rawAmount, setRawAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('food')
  const [method, setMethod] = useState<'cash' | 'transfer' | 'credit_card'>('cash')
  const [cardId, setCardId] = useState<number | null>(null)
  const [installments, setInstallments] = useState(1)
  const [date, setDate] = useState(today)
  const [isShared, setIsShared] = useState(false)
  const [splitType, setSplitType] = useState<'equal' | 'fixed'>('equal')
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, number>>({})
  const [billingMonth, setBillingMonth] = useState(getInitialBillingMonth)
  const [saving, setSaving] = useState(false)

  const amount = parseInt(rawAmount.replace(/\D/g, '') || '0', 10)
  const installmentAmount = installments > 1 ? Math.floor(amount / installments) : amount

  useEffect(() => {
    if (editingExpense) {
      setRawAmount(String(editingExpense.total_amount))
      setDescription(editingExpense.description ?? '')
      setCategory(editingExpense.category)
      setMethod(editingExpense.payment_method)
      setCardId(editingExpense.card_id)
      setInstallments(editingExpense.installments_count ?? 1)
      setDate(editingExpense.expense_date)
      setIsShared(editingExpense.is_shared)
      if (editingExpense.billing_month) {
        const parts = editingExpense.billing_month.split('-')
        setBillingMonth(`${parts[0]}-${parts[1]}-01`)
      } else {
        setBillingMonth(getInitialBillingMonth())
      }
    }
  }, [editingExpense])

  function getParticipants() {
    if (!isShared || groupMembers.length === 0) return []
    if (splitType === 'equal') {
      const each = Math.floor(amount / (groupMembers.length + 1))
      return [
        { user_id: currentUserId, amount: each, split_type: 'equal' as const },
        ...groupMembers.map(m => ({ user_id: m.user_id, amount: each, split_type: 'equal' as const })),
      ]
    }
    return [
      { user_id: currentUserId, amount: fixedAmounts[currentUserId] ?? 0, split_type: 'fixed' as const },
      ...groupMembers.map(m => ({ user_id: m.user_id, amount: fixedAmounts[m.user_id] ?? 0, split_type: 'fixed' as const })),
    ]
  }

  function resetForm() {
    setRawAmount(''); setDescription(''); setCategory('food'); setMethod('cash')
    setCardId(null); setInstallments(1); setDate(today)
    setIsShared(false); setSplitType('equal'); setFixedAmounts({})
    setBillingMonth(getInitialBillingMonth())
  }

  async function save() {
    if (amount <= 0) return
    setSaving(true)
    try {
      const payload = {
        description: description.trim() || null,
        total_amount: amount,
        category,
        payment_method: method,
        card_id: cardId,
        expense_date: date,
        installments_count: installments,
        is_shared: isShared,
        group_id: isShared && groupMembers.length > 0 ? (groupId ?? null) : null,
        participants: getParticipants(),
        billing_month: method === 'credit_card' ? billingMonth : null,
      }

      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      router.refresh()
      onClose()
      if (!editingExpense) resetForm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editingExpense ? 'Editar gasto' : 'Nuevo gasto'}>
      <div className="flex flex-col gap-6">

        {/* Amount */}
        <Field label="Monto">
          <div
            className="flex items-baseline gap-2 rounded-2xl px-4 py-4 ring-1 ring-white/[0.04] focus-within:ring-[var(--color-accent)]/60"
            style={{ background: 'var(--color-surface-raised)' }}
          >
            <span className="text-2xl font-display" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              inputMode="numeric"
              placeholder="0"
              value={rawAmount}
              onChange={e => setRawAmount(e.target.value.replace(/\D/g, ''))}
              autoFocus={!editingExpense}
              className="w-full bg-transparent text-3xl font-display font-bold tracking-tight outline-none placeholder:text-[var(--color-muted)]/40"
            />
          </div>
          {amount > 0 && (
            <p className="text-xs font-mono mt-1 text-center" style={{ color: 'var(--color-muted)' }}>
              {formatARS(amount)}
            </p>
          )}
        </Field>

        {/* Description */}
        <Field label="Descripción">
          <input
            placeholder="Opcional"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-white/[0.04] placeholder:text-[var(--color-muted)]/60 focus:ring-[var(--color-accent)]/60"
            style={{ background: 'var(--color-surface-raised)' }}
          />
        </Field>

        {/* Category */}
        <Field label="Categoría">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(({ key, label, Icon, color }) => {
              const active = category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 ring-1 transition-colors"
                  style={{
                    background: active ? `${color}1a` : 'var(--color-surface-raised)',
                    boxShadow: active ? `inset 0 0 0 1px ${color}33` : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon size={20} color={active ? color : 'var(--color-muted)'} strokeWidth={1.75} />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: active ? color : 'var(--color-muted)' }}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </Field>

        {/* Payment method */}
        <Field label="Método de pago">
          <div className="flex gap-2">
            {(['cash', 'transfer', 'credit_card'] as const).map(m => {
              const active = method === m
              const label = m === 'cash' ? 'Efectivo' : m === 'transfer' ? 'Transfer' : 'Tarjeta'
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); if (m !== 'credit_card') setCardId(null) }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                  style={{
                    background: active ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    color: active ? '#fff' : 'var(--color-muted)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </Field>

        {/* Card selector */}
        {method === 'credit_card' && (
          <Field label="Tarjeta">
            {cards.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Primero agregá una tarjeta en la sección Tarjetas.
              </p>
            ) : (
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/[0.04]" style={{ background: 'var(--color-surface-raised)' }}>
                {cards.map((card, i) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setCardId(card.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                    style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: card.color }} />
                    <span className="flex-1 text-sm text-left">{card.name}</span>
                    {cardId === card.id && (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Field>
        )}

        {/* Installments */}
        {method === 'credit_card' && cardId && (
          <Field label="Cuotas">
            <div className="flex gap-2 flex-wrap">
              {INSTALLMENT_OPTIONS.map(n => {
                const active = installments === n
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallments(n)}
                    className="px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
                    style={{
                      background: active ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                      color: active ? '#fff' : 'var(--color-muted)',
                    }}
                  >
                    {n === 1 ? '1x' : `${n}x`}
                  </button>
                )
              })}
            </div>
            {amount > 0 && installments > 1 && (
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-muted)' }}>
                {installments} cuotas de {formatARS(installmentAmount)}
              </p>
            )}
          </Field>
        )}

        {/* Billing month */}
        {method === 'credit_card' && (
          <Field label="Mes de cobro">
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3 ring-1 ring-white/[0.04]"
              style={{ background: 'var(--color-surface-raised)' }}
            >
              <button type="button" onClick={() => setBillingMonth(prevMonth(billingMonth))} style={{ color: 'var(--color-muted)' }} className="px-1 text-lg">‹</button>
              <span className="text-sm font-medium">{fmtBillingMonth(billingMonth)}</span>
              <button type="button" onClick={() => setBillingMonth(nextMonth(billingMonth))} style={{ color: 'var(--color-muted)' }} className="px-1 text-lg">›</button>
            </div>
          </Field>
        )}

        {/* Date */}
        <Field label="Fecha">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-white/[0.04]"
            style={{ background: 'var(--color-surface-raised)', colorScheme: 'dark' }}
          />
        </Field>

        {/* Shared expense (groups) */}
        {groupMembers.length > 0 && (
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Gasto compartido</span>
              <button
                type="button"
                onClick={() => setIsShared(!isShared)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ background: isShared ? 'var(--color-accent)' : 'var(--color-border)' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                  style={{ transform: isShared ? 'translateX(1.75rem)' : 'translateX(0.25rem)' }}
                />
              </button>
            </label>

            {isShared && (
              <>
                <div className="flex gap-2">
                  {(['equal', 'fixed'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSplitType(st)}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                      style={{
                        background: splitType === st ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                        color: splitType === st ? '#fff' : 'var(--color-muted)',
                      }}
                    >
                      {st === 'equal' ? '50/50' : 'Monto fijo'}
                    </button>
                  ))}
                </div>

                {splitType === 'equal' && amount > 0 && (
                  <p className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>
                    Cada uno paga: {formatARS(Math.floor(amount / (groupMembers.length + 1)))}
                  </p>
                )}

                {splitType === 'fixed' && (
                  <div className="flex flex-col gap-2">
                    {[{ user_id: currentUserId, display_name: 'Yo' }, ...groupMembers].map(m => (
                      <label key={m.user_id} className="flex items-center gap-3">
                        <span className="text-sm w-20">{m.display_name}</span>
                        <input
                          type="number"
                          className="rounded-2xl px-3 py-2 text-sm flex-1 outline-none"
                          style={{ background: 'var(--color-surface-raised)' }}
                          placeholder="0"
                          value={fixedAmounts[m.user_id] ?? ''}
                          onChange={e => setFixedAmounts(prev => ({
                            ...prev,
                            [m.user_id]: parseInt(e.target.value) || 0,
                          }))}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={save}
          disabled={amount <= 0 || saving}
          className="w-full text-white font-semibold py-4 rounded-2xl disabled:opacity-50 transition-opacity"
          style={{
            background: 'var(--color-accent)',
            boxShadow: '0 8px 24px rgba(124,109,245,0.35)',
          }}
        >
          {saving ? 'Guardando…' : editingExpense ? 'Guardar cambios' : 'Guardar gasto'}
        </button>

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
