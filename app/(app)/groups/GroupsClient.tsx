'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, UserPlus } from 'lucide-react'

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
  const [groups, setGroups] = useState(initialGroups)

  // Create group state
  const [showCreate, setShowCreate] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Add member state (keyed by group id)
  const [addingMemberFor, setAddingMemberFor] = useState<number | null>(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState('')
  const [addMemberSuccess, setAddMemberSuccess] = useState('')

  // Suppress unused variable warning — groups state is set on refresh
  void groups

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
      setAddMemberSuccess(`${data.email} agregado correctamente`)
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
    <div className="p-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Grupos</h1>
        <button
          onClick={() => { setShowCreate(v => !v); setCreateError('') }}
          className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white text-sm font-medium px-3 py-2 rounded-xl"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {/* Create group form */}
      {showCreate && (
        <form onSubmit={handleCreateGroup} className="bg-[var(--color-surface)] rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <p className="text-sm font-medium">Nombre del grupo</p>
          <input
            autoFocus
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Ej: Mauri y Caro"
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--color-border)] focus:border-[var(--color-accent)]"
          />
          {createError && <p className="text-xs text-[var(--color-expense)]">{createError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating || !newGroupName.trim()}
              className="flex-1 bg-[var(--color-accent)] text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50">
              {creating ? 'Creando...' : 'Crear grupo'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-4 text-sm text-[var(--color-muted)] bg-[var(--color-surface-raised)] rounded-xl">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Groups list */}
      {initialGroups.length === 0 && !showCreate ? (
        <div className="text-center py-12">
          <Users size={40} className="mx-auto mb-3 text-[var(--color-muted)]" />
          <p className="text-[var(--color-muted)] text-sm">No tenés grupos todavía</p>
          <p className="text-[var(--color-muted)] text-xs mt-1">Creá uno para compartir gastos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {initialGroups.map(group => (
            <div key={group.id} className="bg-[var(--color-surface)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">{group.name}</h2>
                  <p className="text-xs text-[var(--color-muted)]">
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
                    className="flex items-center gap-1 text-xs text-[var(--color-accent)] bg-[var(--color-surface-raised)] px-3 py-1.5 rounded-xl"
                  >
                    <UserPlus size={13} />
                    Agregar
                  </button>
                )}
              </div>

              {/* Add member form */}
              {addingMemberFor === group.id && (
                <form onSubmit={e => handleAddMember(e, group.id)} className="mb-3 flex flex-col gap-2">
                  <input
                    autoFocus
                    type="email"
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    placeholder="Email de Google de la persona"
                    className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--color-border)] focus:border-[var(--color-accent)]"
                  />
                  {addMemberError && <p className="text-xs text-[var(--color-expense)]">{addMemberError}</p>}
                  {addMemberSuccess && <p className="text-xs text-[var(--color-income)]">{addMemberSuccess}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={addingMember || !memberEmail.trim()}
                      className="flex-1 bg-[var(--color-accent)] text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50">
                      {addingMember ? 'Buscando...' : 'Agregar miembro'}
                    </button>
                    <button type="button" onClick={() => setAddingMemberFor(null)}
                      className="px-4 text-sm text-[var(--color-muted)] bg-[var(--color-surface-raised)] rounded-xl">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Members list */}
              <div className="flex flex-col gap-1">
                {group.members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                    <span>{m.user_id === currentUserId ? 'Vos' : m.user_id.slice(0, 8) + '...'}</span>
                    {m.role === 'owner' && <span className="text-[var(--color-accent)]">owner</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
