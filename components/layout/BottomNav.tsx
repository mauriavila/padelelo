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
                className="flex-1 flex flex-col items-center justify-center gap-0.5"
              >
                <div
                  className="flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200"
                  style={active ? { background: 'var(--color-accent-dim)' } : {}}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    color={active ? 'var(--color-accent)' : 'var(--color-muted)'}
                  />
                </div>
                <span
                  className="text-[10px] font-medium tracking-wide transition-colors duration-200"
                  style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }}
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
