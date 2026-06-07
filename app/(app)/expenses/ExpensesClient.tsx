'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import MonthPicker from '@/components/ui/MonthPicker'
import ExpenseRow from '@/components/expenses/ExpenseRow'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import type { Expense, Card } from '@/lib/types'

interface Props {
  initialExpenses: Expense[]
  initialMonth: string
  cards: Card[]
  currentUserId: string
}

export default function ExpensesClient({ initialExpenses, initialMonth, cards, currentUserId }: Props) {
  const router = useRouter()
  const [month, setMonth] = useState(initialMonth)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  function handleMonthChange(m: string) {
    setMonth(m)
    router.push(`/expenses?month=${m}`)
  }

  return (
    <div className="max-w-[480px] mx-auto">
      <div className="flex items-end justify-between px-6 pt-8 pb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Lista de
          </p>
          <h1 className="text-2xl font-display font-bold tracking-tight">Gastos</h1>
        </div>
        <MonthPicker value={month} onChange={handleMonthChange} />
      </div>

      {initialExpenses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Sin gastos en este mes</p>
        </div>
      ) : (
        <div className="px-6">
          <div className="overflow-hidden rounded-3xl mb-6 ring-1 ring-white/[0.05]" style={{ background: 'var(--color-surface)' }}>
            {initialExpenses.map((e, i) => (
              <div
                key={e.id}
                style={{ borderTop: i > 0 ? `1px solid var(--color-border)` : 'none' }}
              >
                <ExpenseRow
                  expense={e as Expense & { card: Card | null }}
                  onEdit={setEditingExpense}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed right-4 z-30 w-14 h-14 flex items-center justify-center rounded-2xl shadow-[0_10px_32px_rgba(124,109,245,0.45)] ring-4 ring-background transition-transform active:scale-90"
        style={{
          bottom: 'calc(var(--nav-height) + var(--sai-bottom) + 1rem)',
          background: 'var(--color-accent)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cards={cards}
        groupMembers={[]}
        currentUserId={currentUserId}
      />

      <ExpenseForm
        open={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        cards={cards}
        groupMembers={[]}
        currentUserId={currentUserId}
        editingExpense={editingExpense}
      />
    </div>
  )
}
