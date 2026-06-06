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
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>
      <CardForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
