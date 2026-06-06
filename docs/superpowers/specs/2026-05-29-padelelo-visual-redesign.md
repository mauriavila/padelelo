# PADELELO — Visual Redesign Spec
**Fecha:** 2026-05-29
**Alcance:** Rediseño visual completo — todas las pantallas y componentes

---

## Objetivo

Transformar la app de "amateur" a "profesional, de calidad y de lujo". Sin cambios funcionales — solo diseño.

---

## Sistema de Diseño

### Instalación
```
npm install lucide-react
```
Reemplaza TODOS los emojis con íconos SVG de `lucide-react`.

### Nuevas variables CSS en `app/globals.css`

```css
@theme {
  /* existentes */
  --color-brand-red: #e94560;
  --color-brand-navy: #16213e;
  --color-brand-dark: #0f0f0f;
  --color-brand-card: #1a1a2e;
  --color-brand-muted: #aaaaaa;

  /* nuevas */
  --color-brand-orange: #ff6b35;
  --color-brand-surface: #12121f;
}
```

### Estilos globales adicionales en globals.css

```css
/* Glow rojo en botones primarios */
.btn-primary {
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
}
.btn-primary:hover {
  box-shadow: 0 6px 28px rgba(233, 69, 96, 0.6);
}

/* Card base con elevación */
.card-elevated {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

/* Card hover con glow rojo */
.card-hover:hover {
  box-shadow: 0 0 0 1px #e94560, 0 8px 32px rgba(233, 69, 96, 0.15);
}

/* Gradiente de texto */
.gradient-text {
  background: linear-gradient(135deg, #e94560, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Fondo radial sutil */
body {
  background: radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0f0f0f 60%);
  min-height: 100vh;
}
```

---

## Componentes

### BottomNav

- Íconos Lucide: `Home`, `Plus`, `User`, `Trophy`, `BarChart2`
- Botón **Crear** (centro): fondo rojo sólido, rounded-2xl, size más grande, glow rojo, sin label
- Ítem activo: ícono blanco + punto rojo debajo (`w-1 h-1 rounded-full bg-brand-red`)
- Ítems "soon": opacidad 40%, sin badge de texto
- Nav background: `bg-brand-surface/80 backdrop-blur-xl border-t border-white/5`

### DivisionBadge

- Mantener colores por división
- Agregar `font-bold` y padding ligeramente mayor
- Versión `size="lg"` para el perfil

### MatchCard

- Sombra de elevación + `card-hover` en hover
- Ícono `MapPin` (Lucide, 14px, color muted) antes de la ubicación
- Ícono `Clock` antes de la hora
- Separador `<hr>` con `border-white/5` entre header y footer
- Pill de spots: gradiente de fondo `bg-gradient-to-r from-brand-red to-brand-orange`
- Pill "LLENO": `bg-white/5 text-white/30`

### JoinButton (slots de jugadores)

- Slot ocupado: inicial del nombre en círculo de color (mismo color que la división del jugador) + nombre + división badge small
- Slot libre: borde dashed animado con pulso sutil (CSS animation)
- Botón UNIRSE: `.btn-primary` con glow, texto uppercase tracking-widest

### ComingSoon

- Ícono grande con círculo de fondo con gradiente radial sutil
- Features list: cada ítem con check circle de Lucide en rojo

---

## Pantallas

### `/auth` — Login

- Fondo: gradiente radial desde `#1a1a2e` → `#0f0f0f`
- Logo: "PADEL" en blanco, "ELO" con `.gradient-text`
- Subtítulo con opacidad 60%
- Card: `bg-brand-card/50 backdrop-blur-sm border border-white/10`
- Botón Google: sombra `0 2px 12px rgba(0,0,0,0.4)`, no cambiar colores del botón

### `/` — Home

- Header: "PADEL" en blanco, "ELO" con `.gradient-text`
- Subtítulo: "X partidas disponibles" (count dinámico)
- Botón "+ Crear": `.btn-primary`
- Lista: `space-y-3` con `MatchCard` mejorados

### `/partidas/crear` — Crear partida

- Inputs: `bg-brand-surface border border-white/10 focus:border-brand-red`
- Label: uppercase tracking-widest text-xs text-brand-muted
- Select: mismo estilo que inputs
- Toggle público/privado: estilo pill con transición suave
- Botón CREAR: `.btn-primary` full width

### `/partidas/[id]` — Detalle

- Header con gradient overlay sutil
- Slots de jugadores: grid 2x2 con diseño mejorado (ver JoinButton)
- Sección WhatsApp: card con ícono `Share2` de Lucide + `MessageCircle`

### `/perfil` — Mi perfil

- Avatar: círculo con anillo de color según división del jugador (usando `getDivisionColor`)
- Nombre: font-bold size-xl
- Stats: 3 cards individuales con gradiente de fondo `bg-gradient-to-b from-brand-card to-brand-surface`
- ELO card: número con `.gradient-text`
- Botón cerrar sesión: `text-white/30 hover:text-white/60`

### `/perfil/[id]` — Perfil público

- Mismo diseño que `/perfil` sin el botón de cerrar sesión

### `/torneos` y `/ranking` — Próximamente

- Ícono central en círculo con `bg-brand-red/10 border border-brand-red/20`
- Features list con `CheckCircle` de Lucide en rojo
- Fondo con patrón grid muy sutil (CSS background)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `app/globals.css` | Nuevas variables, clases globales, gradiente body |
| `components/BottomNav.tsx` | Lucide icons, Crear CTA, indicador activo |
| `components/MatchCard.tsx` | Lucide icons, separador, gradiente pills |
| `components/DivisionBadge.tsx` | Polish, nueva size "lg" |
| `components/JoinButton.tsx` | Slots rediseñados, btn-primary |
| `components/ComingSoon.tsx` | Lucide icons, círculo gradiente |
| `app/auth/page.tsx` | Gradiente, backdrop blur, gradient text |
| `app/page.tsx` | Gradient text, count dinámico, polish |
| `app/partidas/crear/page.tsx` | Inputs, labels, toggle, btn-primary |
| `app/partidas/[id]/page.tsx` | Header polish, share section |
| `app/perfil/page.tsx` | Avatar ring, stat cards gradient, ELO gradient |
| `app/perfil/[id]/page.tsx` | Mismo que perfil |
| `app/torneos/page.tsx` | Grid bg, icon circle |
| `app/ranking/page.tsx` | Grid bg, icon circle |
