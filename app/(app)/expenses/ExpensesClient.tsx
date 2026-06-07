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
    <div className="max-w-[430px] mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <MonthPicker value={month} onChange={handleMonthChange} />
      </div>

      {initialExpenses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Sin gastos en este mes</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--color-surface)' }}>
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
      )}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-[calc(var(--nav-height)+var(--sai-bottom)+1rem)] right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
        style={{ background: 'var(--color-accent)' }}
      >
        <Plus size={24} />
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
