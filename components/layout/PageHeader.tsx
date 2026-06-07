import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  right?: ReactNode
}

export default function PageHeader({ eyebrow, title, right }: PageHeaderProps) {
  return (
    <header className="flex items-end justify-between px-4 pt-8 pb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
          {eyebrow}
        </p>
        <h1 className="text-2xl font-display tracking-tight">{title}</h1>
      </div>
      {right}
    </header>
  )
}
