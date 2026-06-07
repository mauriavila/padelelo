import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import GroupsClient from './GroupsClient'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let groups: Array<{ id: number; name: string; created_by: string; role: string; members: Array<{ user_id: string; role: string }> }> = []

  try {
    const admin = createAdminClient()
    const { data: memberships } = await admin
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', user!.id)

    const groupIds = (memberships ?? []).map(m => m.group_id)

    if (groupIds.length > 0) {
      const { data: groupData } = await admin
        .from('expense_groups')
        .select('id, name, created_by')
        .in('id', groupIds)

      const { data: allMembers } = await admin
        .from('group_members')
        .select('group_id, user_id, role')
        .in('group_id', groupIds)

      groups = (groupData ?? []).map(g => ({
        ...g,
        role: memberships?.find(m => m.group_id === g.id)?.role ?? 'member',
        members: (allMembers ?? []).filter(m => m.group_id === g.id),
      }))
    }
  } catch {
    // Admin client unavailable (missing SUPABASE_SERVICE_ROLE_KEY) — show empty state
  }

  return <GroupsClient groups={groups} currentUserId={user!.id} />
}
