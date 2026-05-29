# PADELELO — Spec de Diseño
**Fecha:** 2026-05-29
**Stack:** Next.js App Router + Tailwind CSS + Supabase + Vercel
**Tipo:** PWA (Progressive Web App)
**Estilo visual:** Dark Competitivo — fondo negro/navy, acentos rojos (inspirado en FACEIT)

---

## Resumen

PADELELO es una PWA para jugadores de pádel amateur que quieren encontrar partidas y competir con gente de su nivel. El MVP permite crear y unirse a partidas abiertas o privadas, con perfiles que muestran la división del jugador. Las funciones competitivas (ELO calculado, torneos, ranking) se construyen en fases posteriores.

---

## Arquitectura

```
Browser (PWA installable)
    ↕ HTTPS
Next.js App Router — Vercel
    ↕ Supabase JS SDK
Supabase
  ├── PostgreSQL (datos)
  ├── Auth (Google OAuth)
  └── Realtime (actualizaciones en vivo en partidas)
```

- **Deploy:** GitHub → Vercel (automático en cada push)
- **Auth:** Google OAuth via Supabase Auth
- **Real-time:** Supabase Realtime para actualizar `spots_taken` sin recargar página
- **PWA:** `next-pwa` para manifest, service worker e instalación en móvil

---

## Base de Datos (PostgreSQL en Supabase)

### `profiles`
Extiende `auth.users` de Supabase. Se crea automáticamente al registrarse.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Mismo que auth.users.id |
| username | text NOT NULL | Nombre público del jugador |
| elo | int DEFAULT 1000 | Puntuación ELO (empieza en 1000) |
| division | int DEFAULT 3 | Calculada del ELO (1-7). Se actualiza via trigger de Supabase cada vez que cambia `elo`. |
| wins | int DEFAULT 0 | Victorias totales |
| losses | int DEFAULT 0 | Derrotas totales |
| created_at | timestamp | Fecha de registro |

### `matches`
Una partida de pádel (siempre 4 jugadores).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | |
| creator_id | uuid FK → profiles | Quien creó la partida |
| location | text NOT NULL | Nombre del club/cancha |
| scheduled_at | timestamp NOT NULL | Fecha y hora |
| spots_total | int DEFAULT 4 | Siempre 4 en pádel |
| spots_taken | int DEFAULT 1 | Empieza en 1 (el creador) |
| division | int NULLABLE | null = cualquier nivel |
| is_public | bool DEFAULT true | false = solo con invite_code |
| invite_code | text NULLABLE | UUID corto para partidas privadas |
| status | text DEFAULT 'open' | open / full / finished / cancelled |
| created_at | timestamp | |

### `match_players`
Tabla de unión — quién está en cada partida.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| match_id | uuid FK → matches | |
| player_id | uuid FK → profiles | |
| team | int NULLABLE | 1 o 2 (para resultados, fase 2) |
| joined_at | timestamp | |

### `match_results` *(fase 2 — esquema creado, no usado en MVP)*
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | |
| match_id | uuid FK → matches | |
| winner_team | int | 1 o 2 |
| reported_by | uuid FK → profiles | |
| confirmed | bool DEFAULT false | Requiere confirmación del equipo perdedor |
| created_at | timestamp | |

### Divisiones ELO

| División | Rango ELO | Nombre |
|----------|-----------|--------|
| 1 | 0 – 800 | Principiante |
| 2 | 800 – 1000 | Básico |
| 3 | 1000 – 1200 | Intermedio |
| 4 | 1200 – 1400 | Avanzado |
| 5 | 1400 – 1600 | Competitivo |
| 6 | 1600 – 1800 | Elite |
| 7 | 1800+ | Pro |

Todos los jugadores nuevos empiezan en ELO 1000 (División 3 — Intermedio).

---

## Pantallas

### MVP (construidas ahora)

| Ruta | Descripción |
|------|-------------|
| `/` | Home — feed de partidas abiertas, ordenadas por fecha. Si no hay sesión, redirige a `/auth`. |
| `/auth` | Login con Google. Redirect a `/` tras autenticarse. Si ya hay sesión, redirige a `/`. |
| `/partidas/crear` | Formulario: ubicación, fecha/hora, división (opcional), público/privado. |
| `/partidas/[id]` | Detalle de partida: jugadores anotados, spots restantes, botón UNIRSE. Real-time. |
| `/perfil` | Mi perfil: username, ELO, división, partidas jugadas, historial. |
| `/perfil/[id]` | Perfil público de otro jugador. |

### Próximamente (pantallas placeholder)

| Ruta | Placeholder |
|------|-------------|
| `/torneos` | "Próximamente — Torneos por División" con descripción de la feature |
| `/ranking` | "Próximamente — Ranking ELO Nacional" con descripción de la feature |

---

## Flujo Principal

1. Usuario abre PADELELO → ve feed de partidas abiertas
2. Filtra por división o fecha si quiere
3. Toca una partida → ve ubicación, hora, jugadores anotados, spots restantes
4. Toca "UNIRSE" → queda registrado, el contador se actualiza en real-time para todos
5. Para partida privada: el creador comparte el link `/partidas/[id]?code=XXXX` por WhatsApp

---

## Navegación

Barra inferior (mobile-first):
- 🏠 Inicio
- ➕ Crear partida
- 👤 Mi perfil
- 🏆 Torneos `🔜`
- 📊 Ranking `🔜`

---

## Visual

- **Fondo:** `#0f0f0f` / `#1a1a2e`
- **Acento primario:** `#e94560` (rojo FACEIT)
- **Acento secundario:** `#16213e` (navy)
- **Texto:** `#ffffff` / `#aaaaaa`
- **Fuente:** Inter (sans-serif, incluida en Next.js)
- **Botón CTA:** Rojo sólido, texto blanco, mayúsculas, font-weight 700

---

## Fuera de Scope (MVP)

- Cálculo y actualización de ELO (requiere flujo de confirmación de resultados entre los 4 jugadores)
- Sistema de torneos
- Pagos / suscripción premium
- Notificaciones push
- Mapa con ubicación de canchas
- Chat interno

---

## Constraints Técnicos

- Mobile-first — la mayoría de los usuarios acceden desde el celular
- PWA installable — debe tener manifest.json y service worker
- Sin server actions complejos en MVP — leer/escribir directo desde el cliente con Supabase SDK
- Row Level Security en Supabase: partidas privadas solo visibles con invite_code correcto
