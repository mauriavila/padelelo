'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import IncomeForm from '@/components/income/IncomeForm'

export default function IncomePageClient() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--nav-height)+var(--sai-bottom)+1rem)] right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
        style={{ background: 'var(--color-income)', color: '#000' }}
      >
        <Plus size={24} />
      </button>
      <IncomeForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
