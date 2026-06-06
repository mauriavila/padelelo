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
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-income)] text-black rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>
      <IncomeForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
