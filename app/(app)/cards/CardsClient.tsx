'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import CardForm from '@/components/cards/CardForm'

export default function CardsClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--nav-height)+var(--sai-bottom)+1rem)] right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
        style={{ background: 'var(--color-accent)' }}
      >
        <Plus size={24} />
      </button>
      <CardForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
