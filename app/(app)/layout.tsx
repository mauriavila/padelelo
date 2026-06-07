import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div
      className="min-h-dvh"
      style={{ paddingBottom: 'calc(var(--nav-height) + var(--sai-bottom) + 0.5rem)' }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
