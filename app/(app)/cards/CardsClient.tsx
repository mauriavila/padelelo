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
        className="fixed right-4 z-30 w-14 h-14 flex items-center justify-center rounded-2xl shadow-[0_10px_32px_rgba(124,109,245,0.45)] ring-4 ring-background transition-transform active:scale-90"
        style={{
          bottom: 'calc(var(--nav-height) + var(--sai-bottom) + 1rem)',
          background: 'var(--color-accent)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
      <CardForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
