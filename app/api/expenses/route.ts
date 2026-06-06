import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInstallments } from '@/lib/billing'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    description,
    total_amount,
    category,
    payment_method,
    card_id,
    expense_date,
    installments_count,
    is_shared,
    group_id,
    participants,
    billing_month: billing_month_input,
  } = body

  const billing_month: string | null = payment_method === 'credit_card' ? (billing_month_input ?? null) : null

  const { data: expense, error: expErr } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      description,
      total_amount,
      category,
      payment_method,
      card_id: card_id ?? null,
      expense_date,
      is_shared: is_shared ?? false,
      group_id: group_id ?? null,
      installments_count: installments_count ?? 1,
      billing_month,
    })
    .select()
    .single()

  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 400 })

  if (installments_count > 1 && billing_month) {
    const rows = generateInstallments({
      expenseId: expense.id,
      firstBillingMonth: billing_month,
      totalAmount: total_amount,
      installmentsCount: installments_count,
    })
    if (rows.length > 0) {
      const { error: instErr } = await supabase.from('installments').insert(rows)
      if (instErr) return NextResponse.json({ error: instErr.message }, { status: 400 })
    }
  }

  if (is_shared && participants?.length > 0) {
    const { error: partErr } = await supabase
      .from('expense_participants')
      .insert(participants.map((p: { user_id: string; amount: number; split_type: string }) => ({
        ...p,
        expense_id: expense.id,
      })))
    if (partErr) return NextResponse.json({ error: partErr.message }, { status: 400 })
  }

  return NextResponse.json(expense, { status: 201 })
}
