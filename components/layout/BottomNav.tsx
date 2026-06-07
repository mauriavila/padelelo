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
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-white/[0.05]"
      style={{
        paddingBottom: 'var(--sai-bottom)',
        background: 'rgba(9, 9, 15, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <ul className="grid grid-cols-5 px-2 pt-2 pb-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors"
              >
                {active && (
                  <span
                    className="absolute inset-x-2 top-0 h-[2px] rounded-full"
                    style={{
                      background: 'var(--color-accent)',
                      boxShadow: '0 0 12px rgba(124,109,245,0.6)',
                    }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  color={active ? 'var(--color-accent)' : 'var(--color-muted)'}
                />
                <span
                  className="text-[10px] font-mono uppercase tracking-wider transition-colors"
                  style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
