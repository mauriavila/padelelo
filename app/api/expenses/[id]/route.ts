import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, total_amount, category, payment_method, card_id, expense_date, is_shared, billing_month } = body

  const { error } = await supabase
    .from('expenses')
    .update({ description, total_amount, category, payment_method, card_id, expense_date, is_shared, billing_month })
    .eq('id', parseInt(id))
    .eq('user_id', user.id)

  if (error) return Response.json({ error }, { status: 400 })
  return Response.json({ ok: true })
}
