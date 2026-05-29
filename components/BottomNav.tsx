'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',               icon: '🏠', label: 'Inicio',   soon: false },
  { href: '/partidas/crear', icon: '➕', label: 'Crear',    soon: false },
  { href: '/perfil',         icon: '👤', label: 'Perfil',   soon: false },
  { href: '/torneos',        icon: '🏆', label: 'Torneos',  soon: true  },
  { href: '/ranking',        icon: '📊', label: 'Ranking',  soon: true  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-navy z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative
                ${isActive ? 'text-brand-red' : 'text-brand-muted hover:text-white'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.soon && (
                <span className="absolute -top-1 -right-1 bg-brand-navy text-brand-muted text-[8px] px-1 rounded-full border border-brand-muted">
                  🔜
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
