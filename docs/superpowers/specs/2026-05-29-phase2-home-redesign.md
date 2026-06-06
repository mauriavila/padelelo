# PADELELO Fase 2 — Home Page Redesign Spec
**Fecha:** 2026-05-29

---

## Objetivo

Rediseñar la Home Page como un dashboard competitivo: hero card del usuario + feed de partidas con ELO promedio + FAB para crear + bottom nav de 4 tabs.

---

## DB Changes (migration 002)

```sql
-- Agregar campos a matches
ALTER TABLE public.matches ADD COLUMN elo_min INT;
ALTER TABLE public.matches ADD COLUMN elo_max INT;
ALTER TABLE public.matches ADD COLUMN avg_elo INT NOT NULL DEFAULT 1000;

-- Trigger: recalcular avg_elo cuando cambia match_players
CREATE OR REPLACE FUNCTION public.update_match_avg_elo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.matches
  SET avg_elo = (
    SELECT COALESCE(AVG(p.elo)::INT, 1000)
    FROM public.match_players mp
    JOIN public.profiles p ON p.id = mp.player_id
    WHERE mp.match_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.match_id ELSE NEW.match_id END
  )
  WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.match_id ELSE NEW.match_id END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_avg_elo
  AFTER INSERT OR DELETE ON public.match_players
  FOR EACH ROW EXECUTE FUNCTION public.update_match_avg_elo();
```

**Aplicar en Supabase SQL Editor** (paso manual del usuario).

---

## Types Update

Agregar campos a `Match` en `lib/types.ts`:
```typescript
elo_min: number | null
elo_max: number | null
avg_elo: number
```

---

## Nuevos Archivos

```
components/HeroCard.tsx        ← Hero card del usuario (perfil en home)
components/FAB.tsx             ← Floating Action Button circular
```

## Archivos Modificados

```
app/page.tsx                   ← Dashboard: hero + search + feed
app/globals.css                ← Añadir estilos FAB, search pill
components/BottomNav.tsx       ← 4 tabs, sin CTA central, línea activa
components/MatchCard.tsx       ← Nuevo layout: avg ELO + fraction
app/partidas/crear/page.tsx    ← Añadir campos elo_min / elo_max
lib/types.ts                   ← Añadir elo_min, elo_max, avg_elo a Match
supabase/migrations/002_add_elo_fields.sql  ← nueva migración
```

---

## Componentes

### HeroCard (`components/HeroCard.tsx`)

Props: `profile: Profile`, `rank: number`

Layout:
```
┌─────────────────────────────────────────────────┐
│  [Avatar]  NOMBRE APELLIDO      │  1000         │
│  circular  DIV 3 · Intermedio   │  ELO          │
│  iniciales                      │ ╱╱ (diagonal) │
├───────────┬───────────┬─────────┴───────────────┤
│ Partidos  │ Ganados   │ Winrate   │  Ranking     │
│    12     │    8      │  66%      │   #4         │
└───────────┴───────────┴───────────┴──────────────┘
```

**Avatar:** `w-12 h-12` circular, color de fondo basado en `getDivisionColor(division)`.
**Nombre:** uppercase, `font-black`, `text-lg`.
**Badge división:** `DivisionBadge` existente, size "sm".
**ELO derecho:** `text-4xl font-black gradient-text`, separado por `clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%)` en el contenedor derecho (efecto diagonal). Background: `bg-brand-surface/60`.
**4 stats:** grid `grid-cols-4`. Cada stat:
- Número: `text-xl font-black text-white`
- Label: `text-[10px] uppercase tracking-widest text-white/40`
- Winrate: calculado como `Math.round(wins / (wins + losses) * 100) || 0`
- Rank: se pasa como prop, calculado en el server como `COUNT(*) WHERE elo > user.elo + 1`

### FAB (`components/FAB.tsx`)

```typescript
// Botón circular fijo, bottom-right, z-50
// Link a /partidas/crear
// w-14 h-14, rounded-full, gradient bg, shadow rojo
// Plus icon (lucide), size 28, text-white
```

### MatchCard (rediseño)

Nuevo layout:

**Izquierda:**
- Row 1: Pill `[ABIERTO]` o `[LLENO]` + Pill de división `[DIV 3]`
- Row 2: `MapPin` + nombre de cancha (bold)
- Row 3: `Clock` + fecha/hora · `Users` + fracción "2/4"
- Si hay `elo_min` o `elo_max`: línea adicional `🎯 900 → 1300 ELO`

**Derecha (alineado a la derecha, vertical-center):**
- Número grande: `avg_elo` → `text-2xl font-black text-white`
- Label: `text-[9px] uppercase tracking-wider text-white/40` → "ELO avg"

### BottomNav (4 tabs)

Tabs: `Home (/)`, `Perfil (/perfil)`, `Torneos (/torneos)`, `Ranking (/ranking)`

Íconos Lucide: `Home`, `User`, `Trophy`, `BarChart2`

Indicador activo: línea `h-0.5 w-6 bg-brand-red rounded-full` en la base del ítem activo (no punto, sino línea horizontal).

Sin el botón CTA central — reemplazado por FAB.

### Home Page (`app/page.tsx`)

Estructura completa:

```
1. Top Bar
   - "PADELELO" gradient-text logo (izquierda)
   - SlidersHorizontal icon (derecha, abre filtro futuro)

2. HeroCard
   - Datos del usuario autenticado
   - rank calculado desde Supabase

3. Search Bar
   - Pill input: bg-brand-surface, border-white/8
   - Search icon (Lucide), placeholder "Buscar cancha..."
   - Estado: filter string en useState, filtra matches en el cliente

4. "PARTIDOS DISPONIBLES" header
   - Texto uppercase tracking-widest text-white/60 text-xs
   - Badge pill con count

5. Feed de matches
   - MatchCard rediseñados
   - Filtrado por search string (location.toLowerCase().includes(query))

6. FAB
   - Overlay flotante, no afecta scroll
```

**Data fetching (secuencial — rank depende del ELO del profile):**
```typescript
// Primero: profile del usuario
const { data: profile } = await supabase
  .from('profiles').select('*').eq('id', user.id).single()

// Luego en paralelo: matches + rank
const [{ data: matches }, { count: rankCount }] = await Promise.all([
  supabase
    .from('matches')
    .select('*, creator:profiles(*)')
    .eq('is_public', true)
    .in('status', ['open', 'full'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50),
  supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('elo', profile?.elo ?? 1000)
])

const rank = (rankCount ?? 0) + 1
```

### Create Match Form Updates

Agregar después del campo División:

```
ELO Mínimo (opcional): [input number, placeholder "ej. 800"]
ELO Máximo (opcional): [input number, placeholder "ej. 1400"]
```

Mismo estilo que los otros inputs. Guardados como `elo_min` y `elo_max` en el insert.

---

## Spec de Archivos Clave

### `supabase/migrations/002_add_elo_fields.sql`
Contiene el ALTER TABLE + trigger completo (ver arriba).

### `lib/types.ts`
Agregar a interface `Match`:
```typescript
elo_min: number | null
elo_max: number | null
avg_elo: number
```

---

## Fuera de Scope (Fase 1)

- Filtro por ELO (el ícono de filtro es placeholder por ahora)
- Búsqueda por jugadores (solo por cancha/ubicación)
- Teams en match detail (Fase 2)
- Chat (Fase 3)
