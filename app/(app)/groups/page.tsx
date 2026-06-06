import { getGroups, getGroupBalance } from '@/lib/supabase/queries'
import { formatARS } from '@/lib/currency'

export default async function GroupsPage() {
  const groups = await getGroups()
  const groupsWithBalances = await Promise.all(
    groups.map(async group => ({
      group,
      balances: await getGroupBalance(group.id),
    }))
  )

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Grupos</h1>
      {groupsWithBalances.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">
          No tenés grupos configurados. Los grupos se crean desde el panel de Supabase.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groupsWithBalances.map(({ group, balances }) => (
            <div key={group.id} className="bg-[var(--color-surface)] rounded-2xl p-4">
              <h2 className="font-semibold mb-3">{group.name}</h2>
              {balances.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">Sin gastos compartidos aún</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {balances.map(b => (
                    <div key={b.user_id} className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">{b.display_name}</span>
                      <span className={b.balance >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}>
                        {b.balance >= 0
                          ? `Te deben ${formatARS(b.balance)}`
                          : `Les debés ${formatARS(Math.abs(b.balance))}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
