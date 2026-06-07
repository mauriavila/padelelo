import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return Response.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  // Create group
  const { data: group, error: groupError } = await admin
    .from('expense_groups')
    .insert({ name: name.trim(), created_by: user.id })
    .select()
    .single()
  if (groupError) return Response.json({ error: groupError }, { status: 400 })

  // Add creator as owner member
  await admin
    .from('group_members')
    .insert({ group_id: group.id, user_id: user.id, role: 'owner' })

  return Response.json(group)
}
