'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, CreditCard, Users, TrendingUp } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/expenses', icon: List, label: 'Gastos' },
  { href: '/cards', icon: CreditCard, label: 'Tarjetas' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/income', icon: TrendingUp, label: 'Ingresos' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
