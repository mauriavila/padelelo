import { createClient } from './server'
import type { Card, Expense, Installment, Income, ExpenseGroup } from '@/lib/types'

export async function getCards(): Promise<Card[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getExpensesForMonth(yearMonth: string): Promise<Expense[]> {
  const supabase = await createClient()
  const start = `${yearMonth}-01`
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('expenses')
    .select('*, card:cards(*)')
    .or(
      `and(payment_method.neq.credit_card,expense_date.gte.${start},expense_date.lte.${end}),` +
      `and(payment_method.eq.credit_card,installments_count.eq.1,billing_month.eq.${start})`
    )
    .order('expense_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getInstallmentsForMonth(yearMonth: string): Promise<(Installment & { expense: Expense })[]> {
  const supabase = await createClient()
  const dueMonth = `${yearMonth}-01`

  const { data, error } = await supabase
    .from('installments')
    .select('*, expense:expenses(*, card:cards(*))')
    .eq('due_month', dueMonth)
    .order('due_month', { ascending: true })
  if (error) throw error
  return (data ?? []) as (Installment & { expense: Expense })[]
}

export async function getIncomeForMonth(yearMonth: string): Promise<Income[]> {
  const supabase = await createClient()
  const start = `${yearMonth}-01`
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .gte('income_date', start)
    .lte('income_date', end)
    .order('income_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getGroups(): Promise<ExpenseGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_groups')
    .select('*')
  if (error) throw error
  return data ?? []
}

interface BalanceEntry {
  user_id: string
  display_name: string
  balance: number
}

export async function getGroupBalance(groupId: number): Promise<BalanceEntry[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: participantData } = await supabase
    .from('expense_participants')
    .select('user_id, amount, expense:expenses!inner(user_id, group_id)')
    .eq('expense.group_id', groupId)

  if (!participantData) return []

  const balances: Record<string, number> = {}

  for (const row of (participantData as unknown) as Array<{
    user_id: string
    amount: number
    expense: { user_id: string; group_id: number }
  }>) {
    const payer = row.expense.user_id
    const participant = row.user_id

    if (payer === user.id && participant !== user.id) {
      balances[participant] = (balances[participant] ?? 0) + row.amount
    } else if (payer !== user.id && participant === user.id) {
      balances[payer] = (balances[payer] ?? 0) - row.amount
    }
  }

  return Object.entries(balances).map(([uid, balance]) => ({
    user_id: uid,
    display_name: uid.slice(0, 8),
    balance,
  }))
}
