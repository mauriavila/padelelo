'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, UserPlus, X, Crown } from 'lucide-react'

interface Group {
  id: number
  name: string
  created_by: string
  role: string
  members: Array<{ user_id: string; role: string }>
}

interface Props {
  groups: Group[]
  currentUserId: string
}

export default function GroupsClient({ groups: initialGroups, currentUserId }: Props) {
  const router = useRouter()
  const [groups] = useState(initialGroups)

  const [showCreate, setShowCreate] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [addingMemberFor, setAddingMemberFor] = useState<number | null>(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState('')
  const [addMemberSuccess, setAddMemberSuccess] = useState('')

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!newGroupName.trim()) return
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupName.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCreateError(data.error ?? 'Error al crear el grupo')
    } else {
      setNewGroupName('')
      setShowCreate(false)
      router.refresh()
    }
    setCreating(false)
  }

  async function handleAddMember(e: React.FormEvent, groupId: number) {
    e.preventDefault()
    if (!memberEmail.trim()) return
    setAddingMember(true)
    setAddMemberError('')
    setAddMemberSuccess('')
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: memberEmail.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddMemberError(data.error ?? 'Error al agregar miembro')
    } else {
      setAddMemberSuccess(`${data.email} agregado`)
      setMemberEmail('')
      setTimeout(() => {
        setAddingMemberFor(null)
        setAddMemberSuccess('')
        router.refresh()
      }, 1500)
    }
    setAddingMember(false)
  }

  return (
    <div className="max-w-[430px] mx-auto px-6 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-display font-bold tracking-tight">Grupos</h1>
        <button
          onClick={() => { setShowCreate(v => !v); setCreateError('') }}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-2xl transition-all active:scale-95"
          style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {/* Create group form */}
      {showCreate && (
        <form
          onSubmit={handleCreateGroup}
          className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
          style={{ background: 'var(--color-surface)' }}
        >
          <p className="text-sm font-semibold">Nombre del grupo</p>
          <input
            autoFocus
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Ej: Mauri y Caro"
            className="rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {createError && (
            <p className="text-xs" style={{ color: 'var(--color-expense)' }}>{createError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newGroupName.trim()}
              className="flex-1 text-sm font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-40"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              {creating ? 'Creando…' : 'Crear grupo'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 rounded-xl"
              style={{ background: 'var(--color-surface-raised)', color: 'var(--color-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Groups list */}
      {groups.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <Users size={24} style={{ color: 'var(--color-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No tenés grupos todavía</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Creá uno para compartir gastos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map(group => (
            <div key={group.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
              {/* Group header */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-accent-dim)' }}
                >
                  <Users size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{group.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                    {group.role === 'owner' && ' · tuyo'}
                  </p>
                </div>
                {group.role === 'owner' && (
                  <button
                    onClick={() => {
                      setAddingMemberFor(addingMemberFor === group.id ? null : group.id)
                      setMemberEmail('')
                      setAddMemberError('')
                      setAddMemberSuccess('')
                    }}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'var(--color-surface-raised)', color: 'var(--color-accent)' }}
                  >
                    <UserPlus size={13} />
                    Agregar
                  </button>
                )}
              </div>

              {/* Add member form */}
              {addingMemberFor === group.id && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  <form
                    onSubmit={e => handleAddMember(e, group.id)}
                    className="px-4 py-3 flex flex-col gap-2"
                  >
                    <input
                      autoFocus
                      type="email"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      placeholder="Email de Google"
                      className="rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        background: 'var(--color-surface-raised)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    {addMemberError && (
                      <p className="text-xs" style={{ color: 'var(--color-expense)' }}>{addMemberError}</p>
                    )}
                    {addMemberSuccess && (
                      <p className="text-xs" style={{ color: 'var(--color-income)' }}>{addMemberSuccess}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addingMember || !memberEmail.trim()}
                        className="flex-1 text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40 transition-all"
                        style={{ background: 'var(--color-accent)', color: '#fff' }}
                      >
                        {addingMember ? 'Buscando…' : 'Agregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingMemberFor(null)}
                        className="px-3 rounded-xl"
                        style={{ background: 'var(--color-surface-raised)', color: 'var(--color-muted)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Members list */}
              {group.members.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  {group.members.map((m, i) => (
                    <div
                      key={m.user_id}
                      className="flex items-center gap-2 px-4 py-2.5"
                      style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          background: m.role === 'owner' ? 'var(--color-accent-dim)' : 'var(--color-surface-raised)',
                          color: m.role === 'owner' ? 'var(--color-accent)' : 'var(--color-muted)',
                        }}
                      >
                        {m.user_id === currentUserId ? 'V' : m.user_id.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs flex-1" style={{ color: 'var(--color-muted)' }}>
                        {m.user_id === currentUserId ? 'Vos' : m.user_id.slice(0, 8) + '…'}
                      </span>
                      {m.role === 'owner' && (
                        <Crown size={12} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      )}
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
