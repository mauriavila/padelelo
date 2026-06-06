import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { email } = await req.json()
  if (!email?.trim()) return Response.json({ error: 'Email required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify requesting user is owner of this group
  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('group_members')
    .select('role')
    .eq('group_id', parseInt(id))
    .eq('user_id', user.id)
    .single()
  if (membership?.role !== 'owner') return Response.json({ error: 'Not the owner' }, { status: 403 })

  // Look up user by email using auth admin API (needs service role, uses auth schema not expenses)
  // Must use a plain supabase client (no custom schema) for auth.admin
  const authAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: { users }, error: lookupError } = await authAdmin.auth.admin.listUsers()
  if (lookupError) return Response.json({ error: 'Lookup failed' }, { status: 500 })

  const targetUser = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())
  if (!targetUser) return Response.json({ error: 'Usuario no encontrado. Asegurate que ya se haya registrado en la app.' }, { status: 404 })

  // Check not already a member
  const { data: existing } = await admin
    .from('group_members')
    .select('user_id')
    .eq('group_id', parseInt(id))
    .eq('user_id', targetUser.id)
    .single()
  if (existing) return Response.json({ error: 'Ya es miembro del grupo' }, { status: 409 })

  // Add as member
  const { error: insertError } = await admin
    .from('group_members')
    .insert({ group_id: parseInt(id), user_id: targetUser.id, role: 'member' })
  if (insertError) return Response.json({ error: insertError }, { status: 400 })

  return Response.json({ ok: true, email: targetUser.email })
}
