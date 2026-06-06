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

  function handleMonthChange(m: string) {
    setMonth(m)
    router.push(`/expenses?month=${m}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gastos</h1>
        <MonthPicker value={month} onChange={handleMonthChange} />
      </div>

      {initialExpenses.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">
          Sin gastos en {month}
        </p>
      ) : (
        <div>
          {initialExpenses.map(e => (
            <ExpenseRow key={e.id} expense={e as Expense & { card: Card | null }} />
          ))}
        </div>
      )}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg"
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
    </div>
  )
}
