import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await request.json()

  const { data: inst } = await supabase
    .from('installments')
    .select('expense_id')
    .eq('id', id)
    .single()

  if (!inst) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: expense } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', inst.expense_id)
    .single()

  if (expense?.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('installments')
    .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
