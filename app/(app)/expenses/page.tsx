import { getExpensesForMonth, getCards } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import ExpensesClient from './ExpensesClient'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()
  const [expenses, cards] = await Promise.all([getExpensesForMonth(month), getCards()])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialMonth={month}
      cards={cards}
      currentUserId={user?.id ?? ''}
    />
  )
}
