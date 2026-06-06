'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import AmountInput from '@/components/ui/AmountInput'
import type { Card, Expense } from '@/lib/types'
import { formatARS } from '@/lib/currency'

const CATEGORIES = [
  { key: 'food', label: 'Comida', icon: '🍽️' },
  { key: 'transport', label: 'Trans.', icon: '🚗' },
  { key: 'entertainment', label: 'Ocio', icon: '🎬' },
  { key: 'health', label: 'Salud', icon: '💊' },
  { key: 'clothing', label: 'Ropa', icon: '👕' },
  { key: 'home', label: 'Hogar', icon: '🏠' },
  { key: 'other', label: 'Otro', icon: '📦' },
] as const

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

function fmtBillingMonth(ym: string) {
  const [y, m] = ym.split('-')
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${months[parseInt(m) - 1]} ${y}`
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

export default function ExpenseForm({ open, onClose, cards, groupMembers, currentUserId, groupId, editingExpense }: ExpenseFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('other')
  const [method, setMethod] = useState<'cash' | 'transfer' | 'credit_card'>('cash')
  const [cardId, setCardId] = useState<number | null>(null)
  const [installments, setInstallments] = useState(1)
  const [date, setDate] = useState(today)
  const [isShared, setIsShared] = useState(false)
  const [splitType, setSplitType] = useState<'equal' | 'fixed'>('equal')
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, number>>({})
  const [billingMonth, setBillingMonth] = useState(getInitialBillingMonth)
  const [saving, setSaving] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.total_amount)
      setDescription(editingExpense.description ?? '')
      setCategory(editingExpense.category)
      setMethod(editingExpense.payment_method)
      setCardId(editingExpense.card_id)
      setInstallments(editingExpense.installments_count ?? 1)
      setDate(editingExpense.expense_date)
      setIsShared(editingExpense.is_shared)
      if (editingExpense.billing_month) {
        // billing_month from DB is stored as YYYY-MM-DD, normalize to YYYY-MM-01
        const parts = editingExpense.billing_month.split('-')
        setBillingMonth(`${parts[0]}-${parts[1]}-01`)
      } else {
        setBillingMonth(getInitialBillingMonth())
      }
    }
  }, [editingExpense])

  const installmentAmount = installments > 1 ? Math.floor(amount / installments) : amount

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
    setAmount(0); setDescription(''); setCategory('other'); setMethod('cash')
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

  const title = editingExpense ? 'Editar gasto' : 'Nuevo gasto'
  const saveLabel = editingExpense ? 'Guardar cambios' : 'Guardar gasto'

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <AmountInput value={amount} onChange={setAmount} autoFocus={!editingExpense} />

        <input
          className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Categoría</span>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-colors ${
                  category === cat.key
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Método de pago</span>
          <div className="flex gap-2">
            {(['cash', 'transfer', 'credit_card'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); if (m !== 'credit_card') setCardId(null) }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  method === m
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                }`}
              >
                {m === 'cash' ? 'Efectivo' : m === 'transfer' ? 'Transf.' : 'Tarjeta'}
              </button>
            ))}
          </div>
        </div>

        {method === 'credit_card' && (
          <div>
            <span className="text-sm text-[var(--color-muted)] mb-2 block">Tarjeta</span>
            {cards.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">Primero agregá una tarjeta en la sección Tarjetas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setCardId(card.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                      cardId === card.id
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-raised)]'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: card.color }} />
                    {card.name}
                    {card.bank && <span className="text-[var(--color-muted)]">({card.bank})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {method === 'credit_card' && cardId && (
          <div>
            <span className="text-sm text-[var(--color-muted)] mb-2 block">Cuotas</span>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 6, 9, 12, 18, 24].map(n => (
                <button
                  key={n}
                  onClick={() => setInstallments(n)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    installments === n
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                  }`}
                >
                  {n === 1 ? '1 pago' : `${n}x`}
                </button>
              ))}
            </div>
            {amount > 0 && installments > 1 && (
              <p className="text-xs text-[var(--color-muted)] mt-2">
                {installments} cuotas de {formatARS(installmentAmount)}
              </p>
            )}
          </div>
        )}

        {method === 'credit_card' && (
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-2">Mes de cobro</p>
            <div className="flex items-center justify-between bg-[var(--color-surface-raised)] rounded-xl px-4 py-3">
              <button type="button" onClick={() => setBillingMonth(prevMonth(billingMonth))} className="text-[var(--color-muted)] text-lg px-2">‹</button>
              <span className="text-sm font-medium">{fmtBillingMonth(billingMonth)}</span>
              <button type="button" onClick={() => setBillingMonth(nextMonth(billingMonth))} className="text-[var(--color-muted)] text-lg px-2">›</button>
            </div>
            {installments > 1 && (
              <p className="text-xs text-[var(--color-muted)] mt-1 text-center">{installments} cuotas desde {fmtBillingMonth(billingMonth)}</p>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Fecha</span>
          <input
            type="date"
            min="2020-01-01"
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>

        {groupMembers.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between">
              <span className="font-medium">Gasto compartido</span>
              <button
                onClick={() => setIsShared(!isShared)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isShared ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isShared ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </label>

            {isShared && (
              <>
                <div className="flex gap-2">
                  {(['equal', 'fixed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setSplitType(st)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        splitType === st ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      {st === 'equal' ? '50/50' : 'Monto fijo'}
                    </button>
                  ))}
                </div>

                {splitType === 'equal' && amount > 0 && (
                  <p className="text-sm text-[var(--color-muted)]">
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
                          className="bg-[var(--color-surface-raised)] rounded-xl px-3 py-2 text-sm flex-1 outline-none"
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

        <button
          onClick={save}
          disabled={amount <= 0 || saving}
          className="w-full bg-[var(--color-accent)] text-white font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : saveLabel}
        </button>
      </div>
    </BottomSheet>
  )
}
