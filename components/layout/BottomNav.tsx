'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Receipt, CreditCard, Users, TrendingUp } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Resumen' },
  { href: '/expenses', icon: Receipt, label: 'Gastos' },
  { href: '/cards', icon: CreditCard, label: 'Tarjetas' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/income', icon: TrendingUp, label: 'Ingresos' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: 'var(--sai-bottom)' }}
    >
      <div
        className="border-t border-[var(--color-border)]"
        style={{ background: 'rgba(17, 17, 24, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="flex max-w-[430px] mx-auto" style={{ height: 'var(--nav-height)' }}>
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors"
                style={active ? { background: 'var(--color-accent-dim)' } : {}}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  color={active ? 'var(--color-accent)' : 'var(--color-muted)'}
                />
                <span
                  className="text-[10px] uppercase tracking-wider transition-colors"
                  style={{ color: active ? 'var(--color-accent-light)' : 'var(--color-muted)' }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
