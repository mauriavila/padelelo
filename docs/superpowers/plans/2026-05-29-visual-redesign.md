# PADELELO Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform PADELELO from amateur to professional/luxury — replace emoji icons with Lucide SVGs, add shadows/gradients/glow effects, redesign all 11 screens.

**Architecture:** Pure visual changes — no logic, no DB, no API modifications. Install `lucide-react`, update `globals.css` with new utility classes, then update each component/page file with new JSX and Tailwind classes.

**Tech Stack:** lucide-react, Tailwind v4 (CSS @theme), Next.js 16 App Router

**Note on testing:** These are pure visual changes with no business logic. TDD does not apply — verification is `npm run build` passing and visual inspection.

---

## Files Modified

```
app/globals.css                  ← new CSS classes + body gradient
components/BottomNav.tsx         ← Lucide icons + CTA create button
components/MatchCard.tsx         ← MapPin/Clock icons + gradient pill
components/DivisionBadge.tsx     ← polish + size "lg"
components/JoinButton.tsx        ← avatar slots + btn-primary glow
components/ComingSoon.tsx        ← Lucide icons + icon circle
app/auth/page.tsx                ← gradient text + glass card
app/page.tsx                     ← gradient text + match count
app/partidas/crear/page.tsx      ← input/label polish + btn-primary
app/partidas/[id]/page.tsx       ← header polish + share section
app/perfil/page.tsx              ← avatar ring + gradient stats
app/perfil/[id]/page.tsx         ← avatar ring + gradient stats
app/torneos/page.tsx             ← grid bg + icon circle
app/ranking/page.tsx             ← grid bg + icon circle
```

---

## Task 1: Install lucide-react + Update globals.css

**Files:**
- Modify: `app/globals.css`
- (package.json via npm install)

- [ ] **Step 1: Install lucide-react**

```powershell
npm install lucide-react
```
Expected: `added 1 package` without errors.

- [ ] **Step 2: Replace app/globals.css completely**

```css
@import "tailwindcss";

@theme {
  --color-brand-red: #e94560;
  --color-brand-orange: #ff6b35;
  --color-brand-navy: #16213e;
  --color-brand-dark: #0f0f0f;
  --color-brand-card: #1a1a2e;
  --color-brand-surface: #12121f;
  --color-brand-muted: #aaaaaa;
  --font-family-sans: Inter, sans-serif;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  font-family: Inter, sans-serif;
}

body {
  background: radial-gradient(ellipse 100% 60% at 50% 0%, #1a1a2e 0%, #0f0f0f 65%);
  color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
}

main {
  padding-bottom: 5rem;
}

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(135deg, #e94560 0%, #ff6b35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Primary button glow */
.btn-primary {
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}
.btn-primary:hover {
  box-shadow: 0 6px 28px rgba(233, 69, 96, 0.6);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 12px rgba(233, 69, 96, 0.4);
}

/* Elevated card */
.card-elevated {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

/* Card with hover glow */
.card-hover {
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.card-hover:hover {
  box-shadow: 0 0 0 1px #e94560, 0 8px 32px rgba(233, 69, 96, 0.15);
  border-color: #e94560 !important;
}

/* Subtle grid background for coming-soon pages */
.bg-grid {
  background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Pulsing empty slot animation */
@keyframes slot-pulse {
  0%, 100% { border-color: rgba(22, 33, 62, 0.8); }
  50% { border-color: rgba(233, 69, 96, 0.3); }
}
.slot-pulse {
  animation: slot-pulse 2s ease-in-out infinite;
}
```

- [ ] **Step 3: Verify build still works**

```powershell
npm run build
```
Expected: build succeeds, 18/18 tests pass via `npm test`.

- [ ] **Step 4: Commit**

```powershell
git add app/globals.css package.json package-lock.json
git commit -m "feat(design): install lucide-react and add design system CSS"
```

---

## Task 2: Redesign BottomNav

**Files:**
- Modify: `components/BottomNav.tsx`

- [ ] **Step 1: Replace components/BottomNav.tsx completely**

```typescript
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
        {NAV_ITEMS.slice(0, 1).map(item => {
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
        })}

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
```

- [ ] **Step 2: Verify build**

```powershell
npm run build
```
Expected: succeeds without errors.

- [ ] **Step 3: Commit**

```powershell
git add components/BottomNav.tsx
git commit -m "feat(design): redesign BottomNav with Lucide icons and CTA create button"
```

---

## Task 3: Redesign MatchCard + DivisionBadge

**Files:**
- Modify: `components/MatchCard.tsx`
- Modify: `components/DivisionBadge.tsx`

- [ ] **Step 1: Replace components/MatchCard.tsx completely**

```typescript
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { Match } from '@/lib/types'
import DivisionBadge from './DivisionBadge'

interface Props { match: Match }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function MatchCard({ match }: Props) {
  const spotsLeft = match.spots_total - match.spots_taken
  const isFull = match.status === 'full'

  return (
    <Link href={`/partidas/${match.id}`}>
      <div className={`card-elevated card-hover bg-brand-card border rounded-2xl p-4 mb-3
        ${isFull ? 'border-white/5 opacity-50' : 'border-white/8'}`}>

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-brand-muted shrink-0" />
              <p className="text-white font-semibold text-sm truncate">{match.location}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-brand-muted shrink-0" />
              <p className="text-brand-muted text-xs">
                {formatDate(match.scheduled_at)} · {formatTime(match.scheduled_at)}
              </p>
            </div>
          </div>

          {isFull ? (
            <span className="text-xs bg-white/5 text-white/30 px-2.5 py-1 rounded-full font-medium shrink-0">
              LLENO
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #e94560, #ff6b35)' }}>
              {spotsLeft} {spotsLeft === 1 ? 'lugar' : 'lugares'}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-3" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {match.division ? (
            <DivisionBadge division={match.division} size="sm" />
          ) : (
            <span className="text-xs text-brand-muted">Cualquier nivel</span>
          )}
          {match.creator && (
            <span className="text-xs text-white/30">por {match.creator.username}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Replace components/DivisionBadge.tsx completely**

```typescript
import { getDivisionName, getDivisionColor } from '@/lib/divisions'

interface Props {
  division: number
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function DivisionBadge({ division, showName = true, size = 'md' }: Props) {
  const name = getDivisionName(division)
  const color = getDivisionColor(division)

  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' :
    size === 'lg' ? 'text-sm px-4 py-1.5 gap-1.5 font-bold' :
    'text-sm px-3 py-1 gap-1'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${sizeClass}`}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      <span className="font-bold">DIV {division}</span>
      {showName && <span className="opacity-80">· {name}</span>}
    </span>
  )
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```
Expected: succeeds.

- [ ] **Step 4: Commit**

```powershell
git add components/MatchCard.tsx components/DivisionBadge.tsx
git commit -m "feat(design): redesign MatchCard with icons and gradient pill, polish DivisionBadge"
```

---

## Task 4: Redesign JoinButton

**Files:**
- Modify: `components/JoinButton.tsx`

- [ ] **Step 1: Replace components/JoinButton.tsx completely**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Match, MatchPlayer, Profile } from '@/lib/types'
import { getDivisionColor } from '@/lib/divisions'
import DivisionBadge from './DivisionBadge'

interface Props {
  match: Match
  currentUserId: string
}

type MatchPlayerWithProfile = MatchPlayer & { player: Profile | null }

export default function JoinButton({ match: initialMatch, currentUserId }: Props) {
  const supabase = createClient()
  const [match, setMatch] = useState(initialMatch)
  const [players, setPlayers] = useState<MatchPlayerWithProfile[]>([])
  const [loading, setLoading] = useState(false)

  const isJoined = players.some(p => p.player_id === currentUserId)
  const isFull = match.status === 'full'
  const isCreator = match.creator_id === currentUserId
  const spotsLeft = match.spots_total - match.spots_taken

  useEffect(() => {
    supabase
      .from('match_players')
      .select('*, player:profiles(*)')
      .eq('match_id', match.id)
      .then(({ data }) => { if (data) setPlayers(data as MatchPlayerWithProfile[]) })

    const channel = supabase
      .channel(`match-${match.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_players', filter: `match_id=eq.${match.id}` }, () => {
        supabase.from('match_players').select('*, player:profiles(*)').eq('match_id', match.id)
          .then(({ data }) => { if (data) setPlayers(data as MatchPlayerWithProfile[]) })
        supabase.from('matches').select('*').eq('id', match.id).single()
          .then(({ data }) => { if (data) setMatch(data as Match) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [match.id])

  async function handleJoin() {
    setLoading(true)
    await supabase.from('match_players').insert({ match_id: match.id, player_id: currentUserId })
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    await supabase.from('match_players').delete().eq('match_id', match.id).eq('player_id', currentUserId)
    setLoading(false)
  }

  return (
    <div>
      {/* Slots */}
      <div className="mb-5">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
          Jugadores · {match.spots_taken}/{match.spots_total}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: match.spots_total }).map((_, i) => {
            const p = players[i]
            const divColor = p?.player ? getDivisionColor(p.player.division) : null

            return p ? (
              <div key={i} className="bg-brand-card border border-white/8 rounded-2xl p-3.5 card-elevated">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}66)`, border: `1px solid ${divColor}40` }}
                  >
                    {p.player?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.player?.username ?? 'Jugador'}</p>
                    <DivisionBadge division={p.player?.division ?? 3} showName={false} size="sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="slot-pulse border border-dashed rounded-2xl p-3.5 flex items-center gap-2.5"
                style={{ borderColor: 'rgba(22,33,62,0.8)', background: 'rgba(18,18,31,0.4)' }}>
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-white/20" />
                </div>
                <p className="text-white/25 text-sm">Lugar libre</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action button */}
      {!isCreator && (
        isJoined ? (
          <button onClick={handleLeave} disabled={loading}
            className="w-full border border-brand-red/60 text-brand-red font-bold py-4 rounded-2xl uppercase tracking-widest text-sm hover:bg-brand-red/5 transition-colors disabled:opacity-50">
            {loading ? 'Saliendo...' : 'Salir de la partida'}
          </button>
        ) : isFull ? (
          <button disabled
            className="w-full bg-white/5 text-white/20 font-bold py-4 rounded-2xl uppercase tracking-widest text-sm cursor-not-allowed">
            Partida completa
          </button>
        ) : (
          <button onClick={handleJoin} disabled={loading}
            className="btn-primary w-full text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}>
            {loading ? 'Uniéndose...' : `Unirse · ${spotsLeft} ${spotsLeft === 1 ? 'lugar libre' : 'lugares libres'}`}
          </button>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```powershell
npm run build
```
Expected: succeeds.

- [ ] **Step 3: Commit**

```powershell
git add components/JoinButton.tsx
git commit -m "feat(design): redesign JoinButton with avatar slots and premium button"
```

---

## Task 5: Redesign ComingSoon

**Files:**
- Modify: `components/ComingSoon.tsx`

- [ ] **Step 1: Replace components/ComingSoon.tsx completely**

```typescript
import type { ReactNode } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  features: string[]
}

export default function ComingSoon({ icon, title, description, features }: Props) {
  return (
    <div className="bg-grid min-h-screen max-w-lg mx-auto px-4 pt-12 text-center">
      {/* Icon circle */}
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
        style={{
          background: 'radial-gradient(circle, rgba(233,69,96,0.15) 0%, rgba(233,69,96,0.05) 100%)',
          border: '1px solid rgba(233,69,96,0.2)',
          boxShadow: '0 0 40px rgba(233,69,96,0.1)',
        }}>
        {icon}
      </div>

      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{title}</h1>
      <p className="text-brand-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">{description}</p>

      <div className="card-elevated bg-brand-card border border-white/8 rounded-2xl p-5 text-left mb-6">
        <p className="text-brand-red text-xs uppercase tracking-widest font-bold mb-4">Lo que viene</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
              <CheckCircle size={16} className="text-brand-red shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-white/20 text-xs">Seguimos construyendo.</p>
    </div>
  )
}
```

- [ ] **Step 2: Update app/torneos/page.tsx**

```typescript
import { Trophy } from 'lucide-react'
import ComingSoon from '@/components/ComingSoon'

export default function TorneosPage() {
  return (
    <ComingSoon
      icon={<Trophy size={40} className="text-brand-red" />}
      title="Torneos por División"
      description="Competí contra jugadores de tu nivel en torneos organizados por PADELELO."
      features={[
        'Torneos mensuales por cada división (Div 1 a Div 7)',
        'Entrada con pago online — todos los premios van al pool',
        'Brackets automáticos por ELO dentro de cada división',
        'Los resultados impactan directamente en tu ranking',
        'Historial completo de torneos y posiciones',
      ]}
    />
  )
}
```

- [ ] **Step 3: Update app/ranking/page.tsx**

```typescript
import { BarChart2 } from 'lucide-react'
import ComingSoon from '@/components/ComingSoon'

export default function RankingPage() {
  return (
    <ComingSoon
      icon={<BarChart2 size={40} className="text-brand-red" />}
      title="Ranking ELO Nacional"
      description="Un ranking transparente que refleja tu nivel real contra toda la comunidad."
      features={[
        'Ranking nacional y por ciudad (Córdoba, Buenos Aires, etc.)',
        'ELO calculado con algoritmo estándar (como en ajedrez)',
        'Historial de partidas y evolución de tu ELO en el tiempo',
        'Leaderboard por división — ¿quién es el #1 de tu div?',
        'Badges y logros por hitos (100 partidas, primera victoria, etc.)',
      ]}
    />
  )
}
```

- [ ] **Step 4: Commit**

```powershell
git add components/ComingSoon.tsx app/torneos/page.tsx app/ranking/page.tsx
git commit -m "feat(design): redesign ComingSoon with Lucide icons and grid background"
```

---

## Task 6: Redesign Auth page

**Files:**
- Modify: `app/auth/page.tsx`

- [ ] **Step 1: Replace app/auth/page.tsx completely**

```typescript
'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Glow background effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e94560, transparent)' }} />

      {/* Logo */}
      <div className="mb-10 text-center relative">
        <div className="text-5xl font-black tracking-widest mb-2">
          <span className="text-white">PADEL</span>
          <span className="gradient-text">ELO</span>
        </div>
        <p className="text-white/40 text-sm tracking-wide">Tu ranking. Tu nivel.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl p-8 relative"
        style={{
          background: 'rgba(26,26,46,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
        <h2 className="text-white text-xl font-bold mb-1.5">Entrar al juego</h2>
        <p className="text-white/40 text-sm mb-7 leading-relaxed">
          Encontrá partidas, subí de división y demostrá tu nivel.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/auth/page.tsx
git commit -m "feat(design): redesign auth page with gradient logo and glass card"
```

---

## Task 7: Redesign Home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx completely**

```typescript
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Match } from '@/lib/types'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, creator:profiles(*)')
    .eq('is_public', true)
    .in('status', ['open', 'full'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50)

  const count = matches?.length ?? 0

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-white">PADEL</span>
            <span className="gradient-text">ELO</span>
          </h1>
          <p className="text-white/40 text-xs mt-0.5">
            {count > 0 ? `${count} partida${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}` : 'Sin partidas activas'}
          </p>
        </div>
        <Link
          href="/partidas/crear"
          className="btn-primary flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Crear
        </Link>
      </div>

      {/* List */}
      {count > 0 ? (
        <div>
          {matches!.map(match => (
            <MatchCard key={match.id} match={match as Match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎾</div>
          <p className="text-white font-bold text-lg mb-1">Sin partidas todavía</p>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            Creá la primera partida y<br />sumá jugadores de tu nivel.
          </p>
          <Link
            href="/partidas/crear"
            className="btn-primary inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl text-sm"
            style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Crear partida
          </Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/page.tsx
git commit -m "feat(design): redesign home page with gradient logo and match count"
```

---

## Task 8: Redesign Create Match page

**Files:**
- Modify: `app/partidas/crear/page.tsx`

- [ ] **Step 1: Replace app/partidas/crear/page.tsx completely**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DIVISIONS } from '@/lib/divisions'

export default function CrearPartidaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    location: '', date: '', time: '', division: '', is_public: true,
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.location || !form.date || !form.time) {
      setError('Ubicación, fecha y hora son obligatorios')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString()
    const invite_code = !form.is_public ? Math.random().toString(36).substring(2, 8).toUpperCase() : null

    const { data, error: err } = await supabase
      .from('matches')
      .insert({ creator_id: user.id, location: form.location, scheduled_at, division: form.division ? parseInt(form.division) : null, is_public: form.is_public, invite_code })
      .select().single()

    if (err) { setError(err.message); setLoading(false); return }
    await supabase.from('match_players').insert({ match_id: data.id, player_id: user.id })
    router.push(`/partidas/${data.id}`)
  }

  const inputClass = "w-full rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
  const inputStyle = { background: 'rgba(18,18,31,0.8)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={20} className="text-white/60" />
        </Link>
        <h1 className="text-xl font-black text-white tracking-tight">Nueva partida</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ubicación */}
        <div>
          <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
            <MapPin size={12} /> Ubicación / Club
          </label>
          <input type="text" placeholder="Ej: Club Pádel Córdoba - Cancha 3"
            value={form.location} onChange={e => update('location', e.target.value)}
            className={inputClass} style={inputStyle} />
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
              <Calendar size={12} /> Fecha
            </label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-widest mb-2">
              <Clock size={12} /> Hora
            </label>
            <input type="time" value={form.time} onChange={e => update('time', e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* División */}
        <div>
          <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">División (opcional)</label>
          <select value={form.division} onChange={e => update('division', e.target.value)}
            className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Cualquier nivel</option>
            {DIVISIONS.map(d => (
              <option key={d.id} value={d.id}>Div {d.id} · {d.name}</option>
            ))}
          </select>
        </div>

        {/* Público / Privado */}
        <div>
          <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">Visibilidad</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'rgba(18,18,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={() => update('is_public', true)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${form.is_public ? 'text-white' : 'text-white/30'}`}
              style={form.is_public ? { background: 'linear-gradient(135deg, #e94560, #c73652)', boxShadow: '0 2px 12px rgba(233,69,96,0.3)' } : {}}>
              🌐 Pública
            </button>
            <button type="button" onClick={() => update('is_public', false)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${!form.is_public ? 'text-white' : 'text-white/30'}`}
              style={!form.is_public ? { background: 'linear-gradient(135deg, #e94560, #c73652)', boxShadow: '0 2px 12px rgba(233,69,96,0.3)' } : {}}>
              🔒 Privada
            </button>
          </div>
        </div>

        {error && (
          <p className="text-brand-red text-sm flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="btn-primary w-full text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #e94560, #c73652)' }}>
          {loading ? 'Creando...' : 'Crear partida'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add "app/partidas/crear/page.tsx"
git commit -m "feat(design): redesign create match page with polished inputs"
```

---

## Task 9: Redesign Match Detail + Profile pages

**Files:**
- Modify: `app/partidas/[id]/page.tsx`
- Modify: `app/perfil/page.tsx`
- Modify: `app/perfil/[id]/page.tsx`

- [ ] **Step 1: Replace app/partidas/[id]/page.tsx completely**

```typescript
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Share2 } from 'lucide-react'
import { Match } from '@/lib/types'
import DivisionBadge from '@/components/DivisionBadge'
import JoinButton from '@/components/JoinButton'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ code?: string }>
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

export default async function MatchDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { code } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: match } = await supabase
    .from('matches')
    .select('*, creator:profiles(*)')
    .eq('id', id)
    .single()

  if (!match) return notFound()

  if (!match.is_public && match.creator_id !== user.id && (!code || code !== match.invite_code)) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-white font-bold text-xl mb-2">Partida privada</p>
        <p className="text-white/40 text-sm">Necesitás el link de invitación para unirte.</p>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const shareUrl = match.is_public
    ? `${siteUrl}/partidas/${id}`
    : `${siteUrl}/partidas/${id}?code=${match.invite_code}`

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5 mb-5">
        <div className="flex items-start gap-2 mb-1">
          <MapPin size={15} className="text-brand-muted mt-0.5 shrink-0" />
          <h1 className="text-white font-black text-lg leading-tight">{match.location}</h1>
        </div>
        <div className="flex items-center gap-1.5 ml-5.5 mb-4">
          <Clock size={13} className="text-white/30" />
          <p className="text-white/40 text-sm capitalize">{formatFullDate(match.scheduled_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {match.division
            ? <DivisionBadge division={match.division} />
            : <span className="text-white/40 text-sm">Cualquier nivel</span>}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium
            ${match.is_public ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'}`}>
            {match.is_public ? '🌐 Pública' : '🔒 Privada'}
          </span>
        </div>
      </div>

      {/* Join section */}
      <JoinButton match={match as Match} currentUserId={user.id} />

      {/* Share */}
      <div className="mt-5 card-elevated bg-brand-card border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={15} className="text-white/40" />
          <p className="text-white/40 text-xs uppercase tracking-widest">Compartir</p>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent(`¡Sumate a mi partida de pádel! ${shareUrl}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 hover:bg-green-500/15 transition-colors">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-green-400 text-sm font-semibold">Invitar por WhatsApp</p>
            <p className="text-white/30 text-xs">Compartí el link con tus amigos</p>
          </div>
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace app/perfil/page.tsx completely**

```typescript
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import DivisionBadge from '@/components/DivisionBadge'
import MatchCard from '@/components/MatchCard'
import { Match } from '@/lib/types'
import { getDivisionColor } from '@/lib/divisions'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: myMatches } = await supabase
    .from('match_players')
    .select('match:matches(*, creator:profiles(*))')
    .eq('player_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(10)

  const matches = (myMatches ?? []).map((mp: any) => mp.match).filter(Boolean)
  const divColor = getDivisionColor(profile?.division ?? 3)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Profile card */}
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5 mb-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}55)`, border: `2px solid ${divColor}50` }}>
              {profile?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight mb-1">{profile?.username ?? 'Jugador'}</p>
            <DivisionBadge division={profile?.division ?? 3} size="md" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'ELO', value: profile?.elo ?? 1000, gradient: true },
            { label: 'Victorias', value: profile?.wins ?? 0, gradient: false },
            { label: 'Derrotas', value: profile?.losses ?? 0, gradient: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, rgba(18,18,31,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className={`text-2xl font-black mb-0.5 ${stat.gradient ? 'gradient-text' : 'text-white'}`}>
                {stat.value}
              </p>
              <p className="text-white/30 text-xs uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Match history */}
      <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-widest text-white/60">Mis partidas</h2>
      {matches.length > 0
        ? matches.map((m: any) => <MatchCard key={m.id} match={m as Match} />)
        : <p className="text-white/30 text-sm py-4">Todavía no participaste en ninguna partida.</p>}

      {/* Sign out */}
      <form action={signOut} className="mt-8 mb-4">
        <button type="submit"
          className="flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors text-sm">
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Replace app/perfil/[id]/page.tsx completely**

```typescript
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DivisionBadge from '@/components/DivisionBadge'
import { getDivisionColor } from '@/lib/divisions'

interface Props { params: Promise<{ id: string }> }

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) return notFound()

  const divColor = getDivisionColor(profile.division)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="card-elevated bg-brand-card border border-white/8 rounded-3xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${divColor}33, ${divColor}55)`, border: `2px solid ${divColor}50` }}>
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight mb-1">{profile.username}</p>
            <DivisionBadge division={profile.division} size="md" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'ELO', value: profile.elo, gradient: true },
            { label: 'Victorias', value: profile.wins, gradient: false },
            { label: 'Derrotas', value: profile.losses, gradient: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, rgba(18,18,31,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className={`text-2xl font-black mb-0.5 ${stat.gradient ? 'gradient-text' : 'text-white'}`}>{stat.value}</p>
              <p className="text-white/30 text-xs uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run build and tests**

```powershell
npm run build && npm test
```
Expected: build succeeds, 18/18 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add "app/partidas/[id]/page.tsx" app/perfil/page.tsx "app/perfil/[id]/page.tsx"
git commit -m "feat(design): redesign match detail and profile pages with premium styling"
```

---

## Task 10: Push to production

- [ ] **Step 1: Push all commits to GitHub**

```powershell
git push
```
Expected: push succeeds, Vercel auto-deploys.

- [ ] **Step 2: Verify production deploy**

Wait ~2 minutes, then open https://padelelo-beta.vercel.app and verify:
- Logo has gradient text on "ELO"
- Bottom nav has SVG icons (no emojis)
- Create button is elevated red CTA in center
- MatchCards have shadows and gradient pills
- Auth page has glass card effect
