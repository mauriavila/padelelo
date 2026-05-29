'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Trophy, BarChart2, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',        icon: Home,       label: 'Inicio',  soon: false },
  { href: '/perfil',  icon: User,       label: 'Perfil',  soon: false },
  { href: '/torneos', icon: Trophy,     label: 'Torneos', soon: true  },
  { href: '/ranking', icon: BarChart2,  label: 'Ranking', soon: true  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5"
      style={{ background: 'rgba(18,18,31,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">

        {/* Inicio */}
        {(() => {
          const item = NAV_ITEMS[0]
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 relative">
              <Icon size={22} className={isActive ? 'text-white' : 'text-brand-muted'} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-brand-muted'}`}>{item.label}</span>
              {isActive && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-red" />}
            </Link>
          )
        })()}

        {/* Perfil */}
        {(() => {
          const item = NAV_ITEMS[1]
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 relative">
              <Icon size={22} className={isActive ? 'text-white' : 'text-brand-muted'} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-brand-muted'}`}>{item.label}</span>
              {isActive && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-red" />}
            </Link>
          )
        })()}

        {/* CTA Crear — centro */}
        <Link href="/partidas/crear"
          className="btn-primary flex items-center justify-center w-14 h-14 rounded-2xl -mt-5"
          style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}>
          <Plus size={28} className="text-white" strokeWidth={2.5} />
        </Link>

        {/* Torneos + Ranking (soon) */}
        {NAV_ITEMS.slice(2).map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 relative opacity-40">
              <Icon size={22} className="text-brand-muted" strokeWidth={1.8} />
              <span className="text-[10px] font-medium text-brand-muted">{item.label}</span>
            </Link>
          )
        })}

      </div>
    </nav>
  )
}
