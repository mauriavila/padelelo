# Expense Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal expense tracker PWA with credit card installments, automatic billing-month calculation, and shared expenses with fixed amounts per participant.

**Architecture:** Next.js 15 App Router with Server Components for data fetching and Client Components only for interactive forms. Supabase with a custom `expenses` Postgres schema (isolated from PADELELO's `public` schema). Core billing logic is pure TypeScript, fully unit-tested before any UI is built.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind v4 · Supabase (`@supabase/ssr`) · Vitest · React Testing Library

---

## File Structure

```
app/
  layout.tsx                          # Root: PWA meta tags, font, global CSS
  page.tsx                            # Redirect → /dashboard
  globals.css                         # Design tokens (@theme), base styles
  auth/
    page.tsx                          # Google OAuth login page
    callback/route.ts                 # OAuth callback handler
  (app)/
    layout.tsx                        # Auth guard + BottomNav wrapper
    dashboard/page.tsx                # Monthly dashboard (Server Component)
    expenses/page.tsx                 # Expense list with filters (Server Component)
    cards/page.tsx                    # Card management (Server Component)
    groups/page.tsx                   # Group balance (Server Component)
    income/page.tsx                   # Income list (Server Component)

components/
  layout/
    BottomNav.tsx                     # 5-tab bottom navigation
  ui/
    BottomSheet.tsx                   # Slide-up sheet, used for all forms
    MonthPicker.tsx                   # Prev/Next month selector
    AmountInput.tsx                   # Large numeric input with ARS formatting
    CategoryPicker.tsx                # Grid of category icons
    SwipeToAction.tsx                 # Swipe-right to mark paid
  expenses/
    ExpenseForm.tsx                   # Main add-expense bottom sheet (Client)
    ExpenseList.tsx                   # Filterable list (Client)
    ExpenseRow.tsx                    # Single expense row
  cards/
    CardForm.tsx                      # Add/edit card (Client)
    CardChip.tsx                      # Visual card chip (name + color)
  groups/
    GroupBalance.tsx                  # Balance display for a group
  income/
    IncomeForm.tsx                    # Add income bottom sheet (Client)
    IncomeRow.tsx                     # Single income row
  dashboard/
    MonthSummary.tsx                  # Total egresos + cuotas + balance

lib/
  billing.ts                          # calcBillingMonth(), generateInstallments()
  types.ts                            # All DB-derived TypeScript interfaces
  currency.ts                         # formatARS() — peso formatting
  supabase/
    client.ts                         # Browser client { db: { schema: 'expenses' } }
    server.ts                         # Server client (cookies)
    queries.ts                        # All DB query functions

supabase/
  migrations/
    002_expenses_schema.sql           # Full schema: tables + RLS + trigger

middleware.ts                         # Protect /dashboard, /expenses, /cards, /groups, /income
public/
  manifest.json                       # PWA manifest
  sw.js                               # Service worker (cache-first for assets)
  icons/
    icon-192.png                      # PWA icon (192x192)
    icon-512.png                      # PWA icon (512x512)

__tests__/
  billing.test.ts                     # Unit tests for billing logic
```

---

## Task 1: Clean Repo — Remove PADELELO, Keep Infrastructure

**Files:**
- Delete: `app/auth/`, `app/partidas/`, `app/perfil/`, `app/ranking/`, `app/torneos/`
- Delete: `components/BottomNav.tsx`, `components/ComingSoon.tsx`, `components/DivisionBadge.tsx`, `components/JoinButton.tsx`, `components/MatchCard.tsx`
- Delete: `lib/divisions.ts`, `lib/elo.ts`, `lib/types.ts`
- Delete: `__tests__/` contents (PADELELO tests)
- Keep: `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `package.json`, `middleware.ts`, `.env.local`, `vercel.json` (if exists)

- [ ] **Step 1: Delete PADELELO app routes**

```bash
cd E:/Proyecto
rm -rf app/auth app/partidas app/perfil app/ranking app/torneos
```

- [ ] **Step 2: Delete PADELELO components**

```bash
rm -f components/BottomNav.tsx components/ComingSoon.tsx components/DivisionBadge.tsx components/JoinButton.tsx components/MatchCard.tsx
```

- [ ] **Step 3: Delete PADELELO lib files**

```bash
rm -f lib/divisions.ts lib/elo.ts lib/types.ts
```

- [ ] **Step 4: Delete old test files**

```bash
rm -rf __tests__
```

- [ ] **Step 5: Reset app/page.tsx to a simple redirect**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 6: Reset app/globals.css with new design tokens**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0f;
  --color-surface: #13131a;
  --color-surface-raised: #1c1c26;
  --color-border: #2a2a38;
  --color-text: #f0f0f5;
  --color-muted: #888899;
  --color-accent: #7c6df5;
  --color-accent-light: #9b8ff7;
  --color-income: #4ade80;
  --color-expense: #f87171;
  --color-card: #f59e0b;
  --font-family-sans: Inter, sans-serif;
}

* { box-sizing: border-box; padding: 0; margin: 0; }

html { font-family: Inter, sans-serif; }

body {
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100dvh;
  overflow-x: hidden;
}
```

- [ ] **Step 7: Reset app/layout.tsx as PWA root**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gastos',
  description: 'Tracker de gastos personal',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Gastos' },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Create directory structure**

```bash
mkdir -p app/auth/callback
mkdir -p app/'(app)'/dashboard app/'(app)'/expenses app/'(app)'/cards app/'(app)'/groups app/'(app)'/income
mkdir -p components/layout components/ui components/expenses components/cards components/groups components/income components/dashboard
mkdir -p lib/supabase
mkdir -p __tests__
mkdir -p public/icons
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on localhost:3000, no import errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: clean PADELELO code, scaffold expense tracker structure"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write types matching the Supabase schema**

```ts
// lib/types.ts

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card'
export type ExpenseCategory = 'food' | 'transport' | 'entertainment' | 'health' | 'clothing' | 'home' | 'other'
export type IncomeCategory = 'reimbursement' | 'salary' | 'sale' | 'other'
export type InstallmentStatus = 'pending' | 'paid'
export type SplitType = 'equal' | 'fixed'
export type GroupRole = 'owner' | 'member'

export interface Card {
  id: number
  user_id: string
  name: string
  bank: string | null
  color: string          // hex color, e.g. '#7c6df5'
  closing_day: number    // 1–28
  due_day: number | null // v2 stub
  created_at: string
}

export interface ExpenseGroup {
  id: number
  name: string
  created_by: string
  created_at: string
}

export interface GroupMember {
  group_id: number
  user_id: string
  role: GroupRole
  joined_at: string
}

export interface Expense {
  id: number
  user_id: string
  description: string | null
  total_amount: number
  category: ExpenseCategory
  payment_method: PaymentMethod
  card_id: number | null
  expense_date: string      // ISO date 'YYYY-MM-DD'
  is_shared: boolean
  group_id: number | null
  installments_count: number
  billing_month: string | null  // 'YYYY-MM-DD' (always day 1)
  created_at: string
}

export interface Installment {
  id: number
  expense_id: number
  installment_number: number
  due_month: string      // 'YYYY-MM-DD' (always day 1)
  amount: number
  status: InstallmentStatus
  paid_at: string | null
}

export interface ExpenseParticipant {
  id: number
  expense_id: number
  user_id: string
  amount: number
  split_type: SplitType
}

export interface Income {
  id: number
  user_id: string
  description: string | null
  amount: number
  category: IncomeCategory
  income_date: string    // ISO date 'YYYY-MM-DD'
  from_user_id: string | null  // v2
  group_id: number | null      // v2
  expense_id: number | null    // v2
  created_at: string
}

// Joined types for UI
export interface ExpenseWithCard extends Expense {
  card: Card | null
}

export interface ExpenseWithParticipants extends Expense {
  card: Card | null
  participants: ExpenseParticipant[]
  installments: Installment[]
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript types for expense tracker schema"
```

---

## Task 3: Core Billing Logic (TDD)

This is the heart of the system. Write tests first, then implementation.

**Files:**
- Create: `lib/billing.ts`
- Create: `__tests__/billing.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// __tests__/billing.test.ts
import { describe, it, expect } from 'vitest'
import { calcBillingMonth, generateInstallments } from '@/lib/billing'

describe('calcBillingMonth', () => {
  // Basic: expense before closing day → next month
  it('returns next month when expense day <= closing day', () => {
    // March 15, closing day 27 → April 1
    expect(calcBillingMonth('2025-03-15', 27)).toBe('2025-04-01')
  })

  // Key case: expense after closing day → month +2
  it('returns month+2 when expense day > closing day', () => {
    // March 28, closing day 27 → May 1
    expect(calcBillingMonth('2025-03-28', 27)).toBe('2025-05-01')
  })

  // Edge: expense ON the closing day counts as before
  it('returns next month when expense day equals closing day', () => {
    // March 27, closing day 27 → April 1
    expect(calcBillingMonth('2025-03-27', 27)).toBe('2025-04-01')
  })

  // Edge: expense in December before closing → January next year
  it('handles year rollover from December', () => {
    // Dec 10, closing day 27 → Jan 1 next year
    expect(calcBillingMonth('2025-12-10', 27)).toBe('2026-01-01')
  })

  // Edge: expense in December after closing → February next year
  it('handles year rollover from December after closing', () => {
    // Dec 28, closing day 27 → Feb 1 next year
    expect(calcBillingMonth('2025-12-28', 27)).toBe('2026-02-01')
  })

  // Non-credit-card: returns null
  it('returns null for non-credit-card payments', () => {
    expect(calcBillingMonth(null, null)).toBeNull()
  })
})

describe('generateInstallments', () => {
  it('returns empty array when installments_count is 1', () => {
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-04-01',
      totalAmount: 10000,
      installmentsCount: 1,
    })
    expect(result).toHaveLength(0)
  })

  it('generates correct number of installment rows', () => {
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-04-01',
      totalAmount: 10000,
      installmentsCount: 4,
    })
    expect(result).toHaveLength(4)
  })

  it('each installment has the correct amount (even split)', () => {
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-04-01',
      totalAmount: 10000,
      installmentsCount: 4,
    })
    result.forEach(inst => expect(inst.amount).toBe(2500))
  })

  it('due_month increments correctly across year boundary', () => {
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-11-01',
      totalAmount: 6000,
      installmentsCount: 3,
    })
    expect(result[0].due_month).toBe('2025-11-01')
    expect(result[1].due_month).toBe('2025-12-01')
    expect(result[2].due_month).toBe('2026-01-01')
  })

  it('installment_number starts at 1', () => {
    const result = generateInstallments({
      expenseId: 5,
      firstBillingMonth: '2025-04-01',
      totalAmount: 3000,
      installmentsCount: 3,
    })
    expect(result[0].installment_number).toBe(1)
    expect(result[1].installment_number).toBe(2)
    expect(result[2].installment_number).toBe(3)
  })

  it('all installments start as pending', () => {
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-04-01',
      totalAmount: 5000,
      installmentsCount: 2,
    })
    result.forEach(inst => expect(inst.status).toBe('pending'))
  })

  it('handles rounding: last installment absorbs remainder', () => {
    // 1000 / 3 = 333.33... → [333, 333, 334]
    const result = generateInstallments({
      expenseId: 1,
      firstBillingMonth: '2025-04-01',
      totalAmount: 1000,
      installmentsCount: 3,
    })
    expect(result[0].amount).toBe(333)
    expect(result[1].amount).toBe(333)
    expect(result[2].amount).toBe(334)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/billing.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/billing'"

- [ ] **Step 3: Implement billing.ts**

```ts
// lib/billing.ts

export interface InstallmentInput {
  expenseId: number
  firstBillingMonth: string   // 'YYYY-MM-DD'
  totalAmount: number
  installmentsCount: number
}

export interface InstallmentRow {
  expense_id: number
  installment_number: number
  due_month: string           // 'YYYY-MM-DD' always day 1
  amount: number
  status: 'pending'
  paid_at: null
}

/**
 * Returns the first day of the billing month for a credit card expense.
 * Returns null if expenseDate or closingDay is null (non-credit-card).
 *
 * Rules:
 *   day <= closingDay → billing month is expenseDate.month + 1
 *   day >  closingDay → billing month is expenseDate.month + 2
 */
export function calcBillingMonth(
  expenseDate: string | null,
  closingDay: number | null,
): string | null {
  if (!expenseDate || closingDay === null) return null

  const [year, month, day] = expenseDate.split('-').map(Number)
  const monthsToAdd = day <= closingDay ? 1 : 2

  let billingYear = year
  let billingMonth = month + monthsToAdd

  while (billingMonth > 12) {
    billingMonth -= 12
    billingYear += 1
  }

  return `${billingYear}-${String(billingMonth).padStart(2, '0')}-01`
}

/**
 * Generates installment rows for an expense.
 * Returns [] when installmentsCount === 1 (single payment, no rows needed).
 *
 * Amount is split evenly; the last installment absorbs any rounding remainder.
 */
export function generateInstallments(input: InstallmentInput): InstallmentRow[] {
  const { expenseId, firstBillingMonth, totalAmount, installmentsCount } = input

  if (installmentsCount <= 1) return []

  const baseAmount = Math.floor(totalAmount / installmentsCount)
  const remainder = totalAmount - baseAmount * installmentsCount

  const rows: InstallmentRow[] = []

  for (let i = 0; i < installmentsCount; i++) {
    const amount = i === installmentsCount - 1 ? baseAmount + remainder : baseAmount

    const [year, month] = firstBillingMonth.split('-').map(Number)
    let m = month + i
    let y = year
    while (m > 12) { m -= 12; y += 1 }
    const due_month = `${y}-${String(m).padStart(2, '0')}-01`

    rows.push({
      expense_id: expenseId,
      installment_number: i + 1,
      due_month,
      amount,
      status: 'pending',
      paid_at: null,
    })
  }

  return rows
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/billing.test.ts
```

Expected: all 13 tests PASS.

- [ ] **Step 5: Write currency utility**

```ts
// lib/currency.ts
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/billing.ts lib/currency.ts __tests__/billing.test.ts
git commit -m "feat: add billing logic with unit tests and currency formatter"
```

---

## Task 4: Supabase Migration — expenses Schema

**Files:**
- Create: `supabase/migrations/002_expenses_schema.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/002_expenses_schema.sql

-- Create dedicated schema (isolated from PADELELO's public schema)
CREATE SCHEMA IF NOT EXISTS expenses;

-- Enable Supabase auth helpers in this schema
GRANT USAGE ON SCHEMA expenses TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA expenses
  GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA expenses
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- ────────────────────────────────────────────────────────────
-- expense_groups
-- ────────────────────────────────────────────────────────────
CREATE TABLE expenses.expense_groups (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- group_members
-- ────────────────────────────────────────────────────────────
CREATE TABLE expenses.group_members (
  group_id   INTEGER NOT NULL REFERENCES expenses.expense_groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- cards
-- ────────────────────────────────────────────────────────────
CREATE TABLE expenses.cards (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  bank         TEXT,
  color        TEXT NOT NULL DEFAULT '#7c6df5',
  closing_day  INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 28),
  due_day      INTEGER CHECK (due_day BETWEEN 1 AND 28),  -- v2 stub, nullable
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- expenses (main table)
-- ────────────────────────────────────────────────────────────
CREATE TYPE expenses.payment_method AS ENUM ('cash', 'transfer', 'credit_card');
CREATE TYPE expenses.expense_category AS ENUM (
  'food', 'transport', 'entertainment', 'health', 'clothing', 'home', 'other'
);

CREATE TABLE expenses.expenses (
  id                 SERIAL PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description        TEXT,
  total_amount       INTEGER NOT NULL CHECK (total_amount > 0),  -- stored in centavos
  category           expenses.expense_category NOT NULL DEFAULT 'other',
  payment_method     expenses.payment_method NOT NULL,
  card_id            INTEGER REFERENCES expenses.cards(id) ON DELETE SET NULL,
  expense_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  is_shared          BOOLEAN NOT NULL DEFAULT false,
  group_id           INTEGER REFERENCES expenses.expense_groups(id) ON DELETE SET NULL,
  installments_count INTEGER NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
  billing_month      DATE,  -- always day 1 of the month; set by app logic on insert
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- installments
-- ────────────────────────────────────────────────────────────
CREATE TYPE expenses.installment_status AS ENUM ('pending', 'paid');

CREATE TABLE expenses.installments (
  id                  SERIAL PRIMARY KEY,
  expense_id          INTEGER NOT NULL REFERENCES expenses.expenses(id) ON DELETE CASCADE,
  installment_number  INTEGER NOT NULL CHECK (installment_number >= 1),
  due_month           DATE NOT NULL,   -- always day 1 of the month
  amount              INTEGER NOT NULL CHECK (amount > 0),
  status              expenses.installment_status NOT NULL DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  UNIQUE (expense_id, installment_number)
);

-- ────────────────────────────────────────────────────────────
-- expense_participants
-- ────────────────────────────────────────────────────────────
CREATE TYPE expenses.split_type AS ENUM ('equal', 'fixed');

CREATE TABLE expenses.expense_participants (
  id          SERIAL PRIMARY KEY,
  expense_id  INTEGER NOT NULL REFERENCES expenses.expenses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  split_type  expenses.split_type NOT NULL DEFAULT 'equal',
  UNIQUE (expense_id, user_id)
);

-- ────────────────────────────────────────────────────────────
-- income
-- ────────────────────────────────────────────────────────────
CREATE TYPE expenses.income_category AS ENUM ('reimbursement', 'salary', 'sale', 'other');

CREATE TABLE expenses.income (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description   TEXT,
  amount        INTEGER NOT NULL CHECK (amount > 0),
  category      expenses.income_category NOT NULL DEFAULT 'other',
  income_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  from_user_id  UUID REFERENCES auth.users(id),  -- v2 stub
  group_id      INTEGER REFERENCES expenses.expense_groups(id), -- v2 stub
  expense_id    INTEGER REFERENCES expenses.expenses(id),        -- v2 stub
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX ON expenses.expenses (user_id, expense_date DESC);
CREATE INDEX ON expenses.expenses (user_id, billing_month);
CREATE INDEX ON expenses.installments (due_month, status);
CREATE INDEX ON expenses.installments (expense_id);
CREATE INDEX ON expenses.income (user_id, income_date DESC);

-- ────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────
ALTER TABLE expenses.expense_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.group_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.installments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses.income             ENABLE ROW LEVEL SECURITY;

-- cards: own rows only
CREATE POLICY cards_own ON expenses.cards
  FOR ALL USING (user_id = auth.uid());

-- expense_groups: member can read; owner can modify
CREATE POLICY groups_member_read ON expenses.expense_groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM expenses.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY groups_owner_write ON expenses.expense_groups
  FOR ALL USING (created_by = auth.uid());

-- group_members: can read own memberships
CREATE POLICY group_members_own ON expenses.group_members
  FOR SELECT USING (user_id = auth.uid());

-- expenses: own expenses OR shared expenses where user is participant
CREATE POLICY expenses_own ON expenses.expenses
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY expenses_participant_read ON expenses.expenses
  FOR SELECT USING (
    id IN (SELECT expense_id FROM expenses.expense_participants WHERE user_id = auth.uid())
  );

-- installments: via expense ownership
CREATE POLICY installments_own ON expenses.installments
  FOR ALL USING (
    expense_id IN (SELECT id FROM expenses.expenses WHERE user_id = auth.uid())
  );

-- expense_participants: own participations + expenses I own
CREATE POLICY participants_own ON expenses.expense_participants
  FOR ALL USING (
    user_id = auth.uid()
    OR expense_id IN (SELECT id FROM expenses.expenses WHERE user_id = auth.uid())
  );

-- income: own rows only
CREATE POLICY income_own ON expenses.income
  FOR ALL USING (user_id = auth.uid());
```

- [ ] **Step 2: Apply migration via Supabase Dashboard**

Go to: Supabase Dashboard → SQL Editor → paste the migration → Run.

Alternatively via CLI:
```bash
npx supabase db push
```

- [ ] **Step 3: Configure PostgREST to expose the expenses schema**

In Supabase Dashboard → Settings → API → Extra search path:
Add `expenses` to the list (comma separated from existing values).

This makes the `expenses` schema accessible via the REST API.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_expenses_schema.sql
git commit -m "feat: add Supabase expenses schema with RLS policies"
```

---

## Task 5: Supabase Client + Query Functions

**Files:**
- Modify: `lib/supabase/client.ts`
- Modify: `lib/supabase/server.ts`
- Create: `lib/supabase/queries.ts`

- [ ] **Step 1: Update browser client with expenses schema**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'expenses' } }
  )
}
```

- [ ] **Step 2: Update server client with expenses schema**

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'expenses' },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 3: Write query functions**

```ts
// lib/supabase/queries.ts
import { createClient } from './server'
import type { Card, Expense, Installment, Income, ExpenseGroup } from '@/lib/types'

// ── Cards ─────────────────────────────────────────────────────
export async function getCards(): Promise<Card[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ── Expenses for a given month ─────────────────────────────────
// Returns expenses where:
//   - cash/transfer: expense_date is in the given month
//   - credit card single: billing_month is the given month
//   - credit card with installments: via installments table
export async function getExpensesForMonth(yearMonth: string): Promise<Expense[]> {
  const supabase = await createClient()
  const start = `${yearMonth}-01`
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('expenses')
    .select('*, card:cards(*)')
    .or(
      `and(payment_method.neq.credit_card,expense_date.gte.${start},expense_date.lte.${end}),` +
      `and(payment_method.eq.credit_card,installments_count.eq.1,billing_month.eq.${start})`
    )
    .order('expense_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Installments for a given month ─────────────────────────────
export async function getInstallmentsForMonth(yearMonth: string): Promise<(Installment & { expense: Expense })[]> {
  const supabase = await createClient()
  const dueMonth = `${yearMonth}-01`

  const { data, error } = await supabase
    .from('installments')
    .select('*, expense:expenses(*, card:cards(*))')
    .eq('due_month', dueMonth)
    .order('due_month', { ascending: true })
  if (error) throw error
  return (data ?? []) as (Installment & { expense: Expense })[]
}

// ── Income for a given month ────────────────────────────────────
export async function getIncomeForMonth(yearMonth: string): Promise<Income[]> {
  const supabase = await createClient()
  const start = `${yearMonth}-01`
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .gte('income_date', start)
    .lte('income_date', end)
    .order('income_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Groups ─────────────────────────────────────────────────────
export async function getGroups(): Promise<ExpenseGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_groups')
    .select('*')
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts lib/supabase/queries.ts
git commit -m "feat: configure Supabase clients for expenses schema + query functions"
```

---

## Task 6: Auth — Google OAuth + Middleware

**Files:**
- Create: `app/auth/page.tsx`
- Create: `app/auth/callback/route.ts`
- Modify: `middleware.ts`

- [ ] **Step 1: Write the login page**

```tsx
// app/auth/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Gastos</h1>
        <p className="text-[var(--color-muted)]">Tu tracker de gastos personal</p>
      </div>
      <LoginButton />
    </div>
  )
}
```

- [ ] **Step 2: Write LoginButton client component**

```tsx
// app/auth/LoginButton.tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  async function signIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={signIn}
      className="w-full max-w-xs bg-white text-gray-900 font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-3"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continuar con Google
    </button>
  )
}
```

- [ ] **Step 3: Write OAuth callback route**

```ts
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

- [ ] **Step 4: Update middleware**

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = ['/dashboard', '/expenses', '/cards', '/groups', '/income']
    .some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
}
```

- [ ] **Step 5: Commit**

```bash
git add app/auth/ middleware.ts
git commit -m "feat: add Google OAuth auth with Supabase + route protection"
```

---

## Task 7: App Layout + Bottom Navigation

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/BottomNav.tsx`

- [ ] **Step 1: Write the BottomNav component**

```tsx
// components/layout/BottomNav.tsx
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
    <nav className="fixed bottom-0 inset-x-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-inset-bottom">
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
```

- [ ] **Step 2: Write the protected app layout**

```tsx
// app/(app)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 3: Create placeholder pages for each route (so the app navigates)**

```tsx
// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return <div className="p-4">Dashboard — en construcción</div>
}
```

```tsx
// app/(app)/expenses/page.tsx
export default function ExpensesPage() {
  return <div className="p-4">Gastos — en construcción</div>
}
```

```tsx
// app/(app)/cards/page.tsx
export default function CardsPage() {
  return <div className="p-4">Tarjetas — en construcción</div>
}
```

```tsx
// app/(app)/groups/page.tsx
export default function GroupsPage() {
  return <div className="p-4">Grupos — en construcción</div>
}
```

```tsx
// app/(app)/income/page.tsx
export default function IncomePage() {
  return <div className="p-4">Ingresos — en construcción</div>
}
```

- [ ] **Step 4: Verify navigation works**

Start dev server and verify:
- `/auth` shows login page
- After login, `/dashboard` shows placeholder with bottom nav
- All 5 tabs navigate correctly
- Non-logged users are redirected to `/auth`

- [ ] **Step 5: Commit**

```bash
git add app/'(app)'/ components/layout/BottomNav.tsx
git commit -m "feat: add app layout with bottom navigation and auth guard"
```

---

## Task 8: UI Primitives — BottomSheet + AmountInput + MonthPicker

**Files:**
- Create: `components/ui/BottomSheet.tsx`
- Create: `components/ui/AmountInput.tsx`
- Create: `components/ui/MonthPicker.tsx`

- [ ] **Step 1: Write BottomSheet**

```tsx
// components/ui/BottomSheet.tsx
'use client'
import { useEffect } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-[var(--color-surface)] rounded-t-3xl max-h-[90dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="px-4 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write AmountInput**

```tsx
// components/ui/AmountInput.tsx
'use client'
import { useRef, useEffect } from 'react'
import { formatARS } from '@/lib/currency'

interface AmountInputProps {
  value: number   // stored as integer (centavos)
  onChange: (value: number) => void
  autoFocus?: boolean
}

export default function AmountInput({ value, onChange, autoFocus }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip non-digits and parse as integer centavos
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw ? parseInt(raw, 10) : 0)
  }

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <span className="text-[var(--color-muted)] text-sm">Monto</span>
      <div className="relative flex items-center">
        <span className="text-4xl font-bold text-[var(--color-muted)] mr-1">$</span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={value > 0 ? value.toString() : ''}
          onChange={handleChange}
          placeholder="0"
          className="text-5xl font-bold bg-transparent border-none outline-none w-48 text-center"
        />
      </div>
      {value > 0 && (
        <span className="text-[var(--color-muted)] text-sm">{formatARS(value)}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write MonthPicker**

```tsx
// components/ui/MonthPicker.tsx
'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthPickerProps {
  value: string   // 'YYYY-MM'
  onChange: (value: string) => void
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number)

  function prev() {
    let m = month - 1, y = year
    if (m < 1) { m = 12; y -= 1 }
    onChange(`${y}-${String(m).padStart(2, '0')}`)
  }

  function next() {
    let m = month + 1, y = year
    if (m > 12) { m = 1; y += 1 }
    onChange(`${y}-${String(m).padStart(2, '0')}`)
  }

  return (
    <div className="flex items-center gap-4">
      <button onClick={prev} className="p-2 rounded-full hover:bg-[var(--color-surface-raised)]">
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold min-w-[120px] text-center">
        {MONTHS[month - 1]} {year}
      </span>
      <button onClick={next} className="p-2 rounded-full hover:bg-[var(--color-surface-raised)]">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/
git commit -m "feat: add BottomSheet, AmountInput, and MonthPicker UI components"
```

---

## Task 9: Cards — CRUD

**Files:**
- Create: `components/cards/CardForm.tsx`
- Create: `components/cards/CardChip.tsx`
- Modify: `app/(app)/cards/page.tsx`
- Create: `app/api/cards/route.ts`

- [ ] **Step 1: Write CardChip**

```tsx
// components/cards/CardChip.tsx
import type { Card } from '@/lib/types'

export default function CardChip({ card }: { card: Card }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
      style={{ background: card.color + '22', border: `1px solid ${card.color}44` }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: card.color }} />
      <span>{card.name}</span>
      {card.bank && <span className="text-[var(--color-muted)]">· {card.bank}</span>}
      <span className="text-[var(--color-muted)]">cierre {card.closing_day}</span>
    </div>
  )
}
```

- [ ] **Step 2: Write the CardForm**

```tsx
// components/cards/CardForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'

const COLORS = ['#7c6df5','#f59e0b','#4ade80','#f87171','#60a5fa','#f472b6','#a78bfa']

interface CardFormProps {
  open: boolean
  onClose: () => void
}

export default function CardForm({ open, onClose }: CardFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [closingDay, setClosingDay] = useState(20)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bank: bank.trim() || null, color, closing_day: closingDay }),
      })
      router.refresh()
      onClose()
      setName(''); setBank(''); setColor(COLORS[0]); setClosingDay(20)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nueva tarjeta">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Nombre</span>
          <input
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            placeholder="VISA Banco Galicia"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Banco (opcional)</span>
          <input
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            placeholder="Galicia"
            value={bank}
            onChange={e => setBank(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--color-muted)]">Color</span>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: c,
                  transform: color === c ? 'scale(1.25)' : 'scale(1)',
                  outline: color === c ? `2px solid white` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Día de cierre</span>
          <input
            type="number"
            min={1}
            max={28}
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none w-24"
            value={closingDay}
            onChange={e => setClosingDay(Math.max(1, Math.min(28, parseInt(e.target.value) || 1)))}
          />
          <span className="text-xs text-[var(--color-muted)]">
            Gastos después del día {closingDay} van al mes siguiente
          </span>
        </label>

        <button
          onClick={save}
          disabled={!name.trim() || saving}
          className="w-full bg-[var(--color-accent)] text-white font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar tarjeta'}
        </button>
      </div>
    </BottomSheet>
  )
}
```

- [ ] **Step 3: Write the cards API route**

```ts
// app/api/cards/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, bank, color, closing_day } = body

  const { data, error } = await supabase
    .from('cards')
    .insert({ user_id: user.id, name, bank, color, closing_day })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Build the cards page**

```tsx
// app/(app)/cards/page.tsx
import { getCards } from '@/lib/supabase/queries'
import CardChip from '@/components/cards/CardChip'
import CardsClient from './CardsClient'

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tarjetas</h1>
      {cards.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No tenés tarjetas cargadas aún.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map(card => <CardChip key={card.id} card={card} />)}
        </div>
      )}
      <CardsClient />
    </div>
  )
}
```

```tsx
// app/(app)/cards/CardsClient.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import CardForm from '@/components/cards/CardForm'

export default function CardsClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>
      <CardForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/'(app)'/cards/ app/api/cards/ components/cards/
git commit -m "feat: cards CRUD — add/view/delete credit cards with closing day"
```

---

## Task 10: Add Expense Form

**Files:**
- Create: `components/expenses/ExpenseForm.tsx`
- Create: `app/api/expenses/route.ts`

- [ ] **Step 1: Write the expense API route**

```ts
// app/api/expenses/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calcBillingMonth, generateInstallments } from '@/lib/billing'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    description,
    total_amount,
    category,
    payment_method,
    card_id,
    expense_date,
    installments_count,
    is_shared,
    group_id,
    participants, // [{ user_id, amount, split_type }]
  } = body

  // Compute billing_month for credit card purchases
  let billing_month: string | null = null
  if (payment_method === 'credit_card' && card_id) {
    // Fetch card to get closing_day
    const { data: card } = await supabase.from('cards').select('closing_day').eq('id', card_id).single()
    if (card) {
      billing_month = calcBillingMonth(expense_date, card.closing_day)
    }
  }

  // Insert the expense
  const { data: expense, error: expErr } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      description,
      total_amount,
      category,
      payment_method,
      card_id: card_id ?? null,
      expense_date,
      is_shared: is_shared ?? false,
      group_id: group_id ?? null,
      installments_count: installments_count ?? 1,
      billing_month,
    })
    .select()
    .single()

  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 400 })

  // Generate installment rows (only when installments_count > 1)
  if (installments_count > 1 && billing_month) {
    const rows = generateInstallments({
      expenseId: expense.id,
      firstBillingMonth: billing_month,
      totalAmount: total_amount,
      installmentsCount: installments_count,
    })
    if (rows.length > 0) {
      const { error: instErr } = await supabase.from('installments').insert(rows)
      if (instErr) return NextResponse.json({ error: instErr.message }, { status: 400 })
    }
  }

  // Insert participants for shared expenses
  if (is_shared && participants?.length > 0) {
    const { error: partErr } = await supabase
      .from('expense_participants')
      .insert(participants.map((p: { user_id: string; amount: number; split_type: string }) => ({
        ...p,
        expense_id: expense.id,
      })))
    if (partErr) return NextResponse.json({ error: partErr.message }, { status: 400 })
  }

  return NextResponse.json(expense, { status: 201 })
}
```

- [ ] **Step 2: Write the ExpenseForm component**

```tsx
// components/expenses/ExpenseForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import AmountInput from '@/components/ui/AmountInput'
import type { Card } from '@/lib/types'
import { calcBillingMonth } from '@/lib/billing'
import { formatARS } from '@/lib/currency'

const CATEGORIES = [
  { key: 'food', label: 'Comida', icon: '🍽️' },
  { key: 'transport', label: 'Trans.', icon: '🚗' },
  { key: 'entertainment', label: 'Ocio', icon: '🎬' },
  { key: 'health', label: 'Salud', icon: '💊' },
  { key: 'clothing', label: 'Ropa', icon: '👕' },
  { key: 'home', label: 'Hogar', icon: '🏠' },
  { key: 'other', label: 'Otro', icon: '📦' },
] as const

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  cards: Card[]
  groupMembers: Array<{ user_id: string; display_name: string }>
  currentUserId: string
}

export default function ExpenseForm({ open, onClose, cards, groupMembers, currentUserId }: ExpenseFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('other')
  const [method, setMethod] = useState<'cash' | 'transfer' | 'credit_card'>('cash')
  const [cardId, setCardId] = useState<number | null>(null)
  const [installments, setInstallments] = useState(1)
  const [date, setDate] = useState(today)
  const [isShared, setIsShared] = useState(false)
  const [splitType, setSplitType] = useState<'equal' | 'fixed'>('equal')
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const selectedCard = cards.find(c => c.id === cardId)

  // Preview: what month will the first payment fall in?
  const billingMonthPreview = method === 'credit_card' && selectedCard && date
    ? calcBillingMonth(date, selectedCard.closing_day)
    : null

  const installmentAmount = installments > 1 ? Math.floor(amount / installments) : amount

  // Build participants array
  function getParticipants() {
    if (!isShared || groupMembers.length === 0) return []
    if (splitType === 'equal') {
      const each = Math.floor(amount / (groupMembers.length + 1)) // +1 for current user
      return [
        { user_id: currentUserId, amount: each, split_type: 'equal' },
        ...groupMembers.map(m => ({ user_id: m.user_id, amount: each, split_type: 'equal' as const })),
      ]
    }
    return [
      { user_id: currentUserId, amount: fixedAmounts[currentUserId] ?? 0, split_type: 'fixed' as const },
      ...groupMembers.map(m => ({ user_id: m.user_id, amount: fixedAmounts[m.user_id] ?? 0, split_type: 'fixed' as const })),
    ]
  }

  async function save() {
    if (amount <= 0) return
    setSaving(true)
    try {
      const participants = getParticipants()
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || null,
          total_amount: amount,
          category,
          payment_method: method,
          card_id: cardId,
          expense_date: date,
          installments_count: installments,
          is_shared: isShared,
          group_id: isShared && groupMembers.length > 0 ? /* get from context */ null : null,
          participants,
        }),
      })
      router.refresh()
      onClose()
      // Reset form
      setAmount(0); setDescription(''); setCategory('other'); setMethod('cash')
      setCardId(null); setInstallments(1); setDate(today)
      setIsShared(false); setSplitType('equal'); setFixedAmounts({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo gasto">
      <div className="flex flex-col gap-5">
        <AmountInput value={amount} onChange={setAmount} autoFocus />

        {/* Description */}
        <input
          className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Category */}
        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Categoría</span>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-colors ${
                  category === cat.key
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Método de pago</span>
          <div className="flex gap-2">
            {(['cash', 'transfer', 'credit_card'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); if (m !== 'credit_card') setCardId(null) }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  method === m
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                }`}
              >
                {m === 'cash' ? 'Efectivo' : m === 'transfer' ? 'Transf.' : 'Tarjeta'}
              </button>
            ))}
          </div>
        </div>

        {/* Card selector */}
        {method === 'credit_card' && (
          <div>
            <span className="text-sm text-[var(--color-muted)] mb-2 block">Tarjeta</span>
            {cards.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">Primero agregá una tarjeta en la sección Tarjetas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setCardId(card.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                      cardId === card.id
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-raised)]'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: card.color }} />
                    {card.name}
                    {card.bank && <span className="text-[var(--color-muted)]">({card.bank})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Installments */}
        {method === 'credit_card' && cardId && (
          <div>
            <span className="text-sm text-[var(--color-muted)] mb-2 block">Cuotas</span>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 6, 9, 12, 18, 24].map(n => (
                <button
                  key={n}
                  onClick={() => setInstallments(n)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    installments === n
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-muted)]'
                  }`}
                >
                  {n === 1 ? '1 pago' : `${n}x`}
                </button>
              ))}
            </div>
            {/* Preview */}
            {amount > 0 && billingMonthPreview && (
              <div className="mt-2 p-3 bg-[var(--color-surface-raised)] rounded-xl text-sm">
                {installments > 1 ? (
                  <span>
                    {installments} cuotas de {formatARS(installmentAmount)} · 1ra cuota en{' '}
                    <strong>{billingMonthPreview.slice(0, 7)}</strong>
                  </span>
                ) : (
                  <span>
                    Se cobra en <strong>{billingMonthPreview.slice(0, 7)}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Fecha</span>
          <input
            type="date"
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>

        {/* Shared toggle */}
        {groupMembers.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between">
              <span className="font-medium">Gasto compartido</span>
              <button
                onClick={() => setIsShared(!isShared)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isShared ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isShared ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </label>

            {isShared && (
              <>
                <div className="flex gap-2">
                  {(['equal', 'fixed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setSplitType(st)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        splitType === st ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      {st === 'equal' ? '50/50' : 'Monto fijo'}
                    </button>
                  ))}
                </div>

                {splitType === 'equal' && amount > 0 && (
                  <p className="text-sm text-[var(--color-muted)]">
                    Cada uno paga: {formatARS(Math.floor(amount / (groupMembers.length + 1)))}
                  </p>
                )}

                {splitType === 'fixed' && (
                  <div className="flex flex-col gap-2">
                    {[{ user_id: currentUserId, display_name: 'Yo' }, ...groupMembers].map(m => (
                      <label key={m.user_id} className="flex items-center gap-3">
                        <span className="text-sm w-20">{m.display_name}</span>
                        <input
                          type="number"
                          className="bg-[var(--color-surface-raised)] rounded-xl px-3 py-2 text-sm flex-1 outline-none"
                          placeholder="0"
                          value={fixedAmounts[m.user_id] ?? ''}
                          onChange={e => setFixedAmounts(prev => ({
                            ...prev,
                            [m.user_id]: parseInt(e.target.value) || 0,
                          }))}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button
          onClick={save}
          disabled={amount <= 0 || saving}
          className="w-full bg-[var(--color-accent)] text-white font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar gasto'}
        </button>
      </div>
    </BottomSheet>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/expenses/ExpenseForm.tsx app/api/expenses/route.ts
git commit -m "feat: expense form with installments, billing preview, and split options"
```

---

## Task 11: Expenses List Page

**Files:**
- Create: `components/expenses/ExpenseRow.tsx`
- Modify: `app/(app)/expenses/page.tsx`
- Create: `app/(app)/expenses/ExpensesClient.tsx`

- [ ] **Step 1: Write ExpenseRow**

```tsx
// components/expenses/ExpenseRow.tsx
import type { Expense, Card } from '@/lib/types'
import { formatARS } from '@/lib/currency'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', transport: '🚗', entertainment: '🎬',
  health: '💊', clothing: '👕', home: '🏠', other: '📦',
}

interface ExpenseRowProps {
  expense: Expense & { card?: Card | null }
}

export default function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-raised)] flex items-center justify-center text-lg flex-shrink-0">
        {CATEGORY_ICONS[expense.category] ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{expense.description ?? expense.category}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {expense.expense_date}
          {expense.card && (
            <span style={{ color: expense.card.color }}> · {expense.card.name}</span>
          )}
          {expense.installments_count > 1 && (
            <span className="text-[var(--color-muted)]"> · {expense.installments_count} cuotas</span>
          )}
          {expense.is_shared && <span className="text-[var(--color-accent-light)]"> · Compartido</span>}
        </p>
      </div>
      <span className="font-semibold text-[var(--color-expense)]">
        -{formatARS(expense.total_amount)}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Build the expenses page**

```tsx
// app/(app)/expenses/page.tsx
import { getExpensesForMonth } from '@/lib/supabase/queries'
import ExpensesClient from './ExpensesClient'
import type { Expense } from '@/lib/types'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()
  const expenses = await getExpensesForMonth(month)

  return <ExpensesClient initialExpenses={expenses} initialMonth={month} />
}
```

```tsx
// app/(app)/expenses/ExpensesClient.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import MonthPicker from '@/components/ui/MonthPicker'
import ExpenseRow from '@/components/expenses/ExpenseRow'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import type { Expense, Card } from '@/lib/types'

interface Props {
  initialExpenses: Expense[]
  initialMonth: string
  cards?: Card[]
}

export default function ExpensesClient({ initialExpenses, initialMonth, cards = [] }: Props) {
  const router = useRouter()
  const [month, setMonth] = useState(initialMonth)
  const [formOpen, setFormOpen] = useState(false)

  function handleMonthChange(m: string) {
    setMonth(m)
    router.push(`/expenses?month=${m}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gastos</h1>
        <MonthPicker value={month} onChange={handleMonthChange} />
      </div>

      {initialExpenses.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">
          Sin gastos en {month}
        </p>
      ) : (
        <div>
          {initialExpenses.map(e => (
            <ExpenseRow key={e.id} expense={e as Expense & { card: Card | null }} />
          ))}
        </div>
      )}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cards={cards}
        groupMembers={[]}
        currentUserId=""
      />
    </div>
  )
}
```

- [ ] **Step 3: Pass cards to the page**

Update `app/(app)/expenses/page.tsx` to fetch cards and pass them:

```tsx
// app/(app)/expenses/page.tsx (updated)
import { getExpensesForMonth, getCards } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import ExpensesClient from './ExpensesClient'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()
  const [expenses, cards] = await Promise.all([getExpensesForMonth(month), getCards()])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialMonth={month}
      cards={cards}
      currentUserId={user?.id ?? ''}
    />
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/'(app)'/expenses/ components/expenses/ExpenseRow.tsx
git commit -m "feat: expenses list page with month picker and add expense form"
```

---

## Task 12: Dashboard — Monthly Summary

**Files:**
- Create: `components/dashboard/MonthSummary.tsx`
- Modify: `app/(app)/dashboard/page.tsx`
- Create: `app/(app)/dashboard/DashboardClient.tsx`

- [ ] **Step 1: Write MonthSummary**

```tsx
// components/dashboard/MonthSummary.tsx
import { formatARS } from '@/lib/currency'

interface MonthSummaryProps {
  totalExpenses: number
  totalInstallments: number
  totalIncome: number
}

export default function MonthSummary({ totalExpenses, totalInstallments, totalIncome }: MonthSummaryProps) {
  const totalOut = totalExpenses + totalInstallments
  const balance = totalIncome - totalOut

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 col-span-2">
        <p className="text-[var(--color-muted)] text-xs mb-1">Balance del mes</p>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
          {formatARS(Math.abs(balance))}
          <span className="text-sm ml-1">{balance >= 0 ? '↑ positivo' : '↓ negativo'}</span>
        </p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4">
        <p className="text-[var(--color-muted)] text-xs mb-1">Egresos propios</p>
        <p className="text-xl font-bold text-[var(--color-expense)]">-{formatARS(totalExpenses)}</p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4">
        <p className="text-[var(--color-muted)] text-xs mb-1">Cuotas del mes</p>
        <p className="text-xl font-bold text-[var(--color-card)]">-{formatARS(totalInstallments)}</p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 col-span-2">
        <p className="text-[var(--color-muted)] text-xs mb-1">Ingresos</p>
        <p className="text-xl font-bold text-[var(--color-income)]">+{formatARS(totalIncome)}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build the dashboard**

```tsx
// app/(app)/dashboard/page.tsx
import { getExpensesForMonth, getInstallmentsForMonth, getIncomeForMonth } from '@/lib/supabase/queries'
import MonthSummary from '@/components/dashboard/MonthSummary'
import DashboardClient from './DashboardClient'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()

  const [expenses, installments, income] = await Promise.all([
    getExpensesForMonth(month),
    getInstallmentsForMonth(month),
    getIncomeForMonth(month),
  ])

  const totalExpenses = expenses.reduce((sum, e) => sum + e.total_amount, 0)
  const totalInstallments = installments.reduce((sum, i) => sum + i.amount, 0)
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)

  return (
    <DashboardClient month={month}>
      <MonthSummary
        totalExpenses={totalExpenses}
        totalInstallments={totalInstallments}
        totalIncome={totalIncome}
      />
      {/* Recent installments due this month */}
      {installments.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-sm text-[var(--color-muted)]">
            Cuotas de tarjeta ({installments.length})
          </h2>
          <div className="bg-[var(--color-surface)] rounded-2xl divide-y divide-[var(--color-border)]">
            {installments.map(inst => (
              <div key={inst.id} className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full ${inst.status === 'paid' ? 'bg-[var(--color-income)]' : 'bg-[var(--color-card)]'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{inst.expense.description ?? inst.expense.category}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Cuota {inst.installment_number}/{inst.expense.installments_count}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-card)]">
                  -{formatARS(inst.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardClient>
  )
}
```

```tsx
// app/(app)/dashboard/DashboardClient.tsx
'use client'
import { useRouter } from 'next/navigation'
import MonthPicker from '@/components/ui/MonthPicker'

interface Props {
  month: string
  children: React.ReactNode
}

export default function DashboardClient({ month, children }: Props) {
  const router = useRouter()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gastos</h1>
        <MonthPicker
          value={month}
          onChange={m => router.push(`/dashboard?month=${m}`)}
        />
      </div>
      {children}
    </div>
  )
}
```

Add the missing `formatARS` import to the dashboard page:
```tsx
import { formatARS } from '@/lib/currency'
```

- [ ] **Step 3: Commit**

```bash
git add app/'(app)'/dashboard/ components/dashboard/
git commit -m "feat: dashboard with monthly summary — expenses, installments, income totals"
```

---

## Task 13: Installments — Mark as Paid

**Files:**
- Create: `app/api/installments/[id]/route.ts`
- Create: `components/ui/SwipeToAction.tsx`

- [ ] **Step 1: Write the PATCH endpoint**

```ts
// app/api/installments/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await request.json()

  // Verify the installment belongs to a user's expense
  const { data: inst } = await supabase
    .from('installments')
    .select('expense_id')
    .eq('id', id)
    .single()

  if (!inst) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: expense } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', inst.expense_id)
    .single()

  if (expense?.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('installments')
    .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/installments/
git commit -m "feat: add PATCH endpoint to mark installments as paid"
```

---

## Task 14: Income — Form + List

**Files:**
- Create: `components/income/IncomeForm.tsx`
- Create: `components/income/IncomeRow.tsx`
- Create: `app/api/income/route.ts`
- Modify: `app/(app)/income/page.tsx`

- [ ] **Step 1: Write income API route**

```ts
// app/api/income/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, amount, category, income_date } = await request.json()

  const { data, error } = await supabase
    .from('income')
    .insert({ user_id: user.id, description, amount, category, income_date })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Write IncomeForm**

```tsx
// components/income/IncomeForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/ui/BottomSheet'
import AmountInput from '@/components/ui/AmountInput'

const INCOME_CATEGORIES = [
  { key: 'reimbursement', label: 'Reembolso', icon: '↩️' },
  { key: 'salary', label: 'Sueldo', icon: '💰' },
  { key: 'sale', label: 'Venta', icon: '🏷️' },
  { key: 'other', label: 'Otro', icon: '📥' },
] as const

export default function IncomeForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (amount <= 0) return
    setSaving(true)
    try {
      await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || null,
          amount,
          category,
          income_date: date,
        }),
      })
      router.refresh()
      onClose()
      setAmount(0); setDescription(''); setCategory('other'); setDate(today)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo ingreso">
      <div className="flex flex-col gap-5">
        <AmountInput value={amount} onChange={setAmount} autoFocus />

        <input
          className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div>
          <span className="text-sm text-[var(--color-muted)] mb-2 block">Categoría</span>
          <div className="grid grid-cols-2 gap-2">
            {INCOME_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                  category === cat.key ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)]'
                }`}
              >
                <span>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">Fecha</span>
          <input
            type="date"
            className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-3 text-base outline-none"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>

        <button
          onClick={save}
          disabled={amount <= 0 || saving}
          className="w-full bg-[var(--color-income)] text-black font-semibold py-4 rounded-2xl disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar ingreso'}
        </button>
      </div>
    </BottomSheet>
  )
}
```

- [ ] **Step 3: Write IncomeRow**

```tsx
// components/income/IncomeRow.tsx
import type { Income } from '@/lib/types'
import { formatARS } from '@/lib/currency'

const INCOME_ICONS: Record<string, string> = {
  reimbursement: '↩️', salary: '💰', sale: '🏷️', other: '📥',
}

export default function IncomeRow({ income }: { income: Income }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-raised)] flex items-center justify-center text-lg">
        {INCOME_ICONS[income.category] ?? '📥'}
      </div>
      <div className="flex-1">
        <p className="font-medium">{income.description ?? income.category}</p>
        <p className="text-xs text-[var(--color-muted)]">{income.income_date}</p>
      </div>
      <span className="font-semibold text-[var(--color-income)]">+{formatARS(income.amount)}</span>
    </div>
  )
}
```

- [ ] **Step 4: Build the income page**

```tsx
// app/(app)/income/page.tsx
import { getIncomeForMonth } from '@/lib/supabase/queries'
import IncomeRow from '@/components/income/IncomeRow'
import IncomePageClient from './IncomePageClient'

function getCurrentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentYearMonth()
  const incomeList = await getIncomeForMonth(month)

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ingresos</h1>
      {incomeList.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">Sin ingresos en {month}</p>
      ) : (
        <div>
          {incomeList.map(i => <IncomeRow key={i.id} income={i} />)}
        </div>
      )}
      <IncomePageClient />
    </div>
  )
}
```

```tsx
// app/(app)/income/IncomePageClient.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import IncomeForm from '@/components/income/IncomeForm'

export default function IncomePageClient() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[var(--color-income)] text-black rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>
      <IncomeForm open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/'(app)'/income/ components/income/ app/api/income/
git commit -m "feat: income tracking — add and list income/reimbursements by month"
```

---

## Task 15: Groups Balance Page

**Files:**
- Modify: `lib/supabase/queries.ts` — add group balance query
- Modify: `app/(app)/groups/page.tsx`

- [ ] **Step 1: Add group balance query**

Add to `lib/supabase/queries.ts`:

```ts
// Add to lib/supabase/queries.ts

interface BalanceEntry {
  user_id: string
  display_name: string
  balance: number  // positive = they owe me; negative = I owe them
}

export async function getGroupBalance(groupId: number): Promise<BalanceEntry[]> {
  const supabase = await createClient()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return []

  // Get all expenses in this group with their participants
  const { data: participantData } = await supabase
    .from('expense_participants')
    .select('user_id, amount, expense:expenses!inner(user_id, group_id)')
    .eq('expense.group_id', groupId)

  if (!participantData) return []

  // Calculate per-user balance
  const balances: Record<string, number> = {}

  for (const row of participantData as Array<{
    user_id: string
    amount: number
    expense: { user_id: string; group_id: number }
  }>) {
    const payer = row.expense.user_id
    const participant = row.user_id

    if (payer === user.id && participant !== user.id) {
      // I paid, they owe me
      balances[participant] = (balances[participant] ?? 0) + row.amount
    } else if (payer !== user.id && participant === user.id) {
      // They paid, I owe them
      balances[payer] = (balances[payer] ?? 0) - row.amount
    }
  }

  return Object.entries(balances).map(([uid, balance]) => ({
    user_id: uid,
    display_name: uid.slice(0, 8), // TODO: fetch display name from auth.users
    balance,
  }))
}
```

- [ ] **Step 2: Build the groups page**

```tsx
// app/(app)/groups/page.tsx
import { getGroups, getGroupBalance } from '@/lib/supabase/queries'
import { formatARS } from '@/lib/currency'

export default async function GroupsPage() {
  const groups = await getGroups()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Grupos</h1>
      {groups.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center">
          No tenés grupos configurados. Los grupos se crean desde el panel de Supabase.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {await Promise.all(groups.map(async (group) => {
            const balances = await getGroupBalance(group.id)
            return (
              <div key={group.id} className="bg-[var(--color-surface)] rounded-2xl p-4">
                <h2 className="font-semibold mb-3">{group.name}</h2>
                {balances.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted)]">Sin gastos compartidos aún</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {balances.map(b => (
                      <div key={b.user_id} className="flex justify-between text-sm">
                        <span className="text-[var(--color-muted)]">{b.display_name}</span>
                        <span className={b.balance >= 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}>
                          {b.balance >= 0
                            ? `Te deben ${formatARS(b.balance)}`
                            : `Les debés ${formatARS(Math.abs(b.balance))}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/'(app)'/groups/ lib/supabase/queries.ts
git commit -m "feat: groups balance page with historical debt calculation"
```

---

## Task 16: PWA — Manifest + Service Worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `app/layout.tsx` (already done in Task 1)

- [ ] **Step 1: Write manifest.json**

```json
// public/manifest.json
{
  "name": "Gastos",
  "short_name": "Gastos",
  "description": "Tracker de gastos personal con cuotas y gastos compartidos",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#0a0a0f",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: Write a basic service worker**

```js
// public/sw.js
const CACHE = 'gastos-v1'
const STATIC = ['/', '/dashboard', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Network-first for API routes; cache-first for static assets
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })))
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached ?? fetch(e.request))
    )
  }
})
```

- [ ] **Step 3: Register service worker in root layout**

Add to `app/layout.tsx` inside `<body>`:

```tsx
// Add inside <body> in app/layout.tsx
<script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
  }
`}} />
```

- [ ] **Step 4: Generate PWA icons**

Create simple placeholder icons (can be replaced later with real icons):
- Navigate to any online PWA icon generator
- Upload a simple logo and export 192x192 and 512x512 PNGs
- Save to `public/icons/icon-192.png` and `public/icons/icon-512.png`

Or generate with ImageMagick if available:
```bash
# Only if ImageMagick is installed
convert -size 192x192 xc:#7c6df5 -fill white -gravity center -font Arial -pointsize 64 -annotate 0 "G" public/icons/icon-192.png
convert -size 512x512 xc:#7c6df5 -fill white -gravity center -font Arial -pointsize 180 -annotate 0 "G" public/icons/icon-512.png
```

- [ ] **Step 5: Verify PWA is installable**

In Chrome DevTools:
- Open Application tab → Manifest (should show "Gastos")
- Application tab → Service Workers (should show registered)
- Lighthouse tab → run PWA audit

- [ ] **Step 6: Commit**

```bash
git add public/
git commit -m "feat: PWA manifest and service worker for installable mobile app"
```

---

## Task 17: Deploy to Vercel

- [ ] **Step 1: Verify build passes**

```bash
npm run build
```

Expected: successful build with no errors.

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

Expected: Vercel auto-deploy triggered.

- [ ] **Step 3: Verify Vercel environment variables**

In Vercel Dashboard → Project Settings → Environment Variables, confirm:
- `NEXT_PUBLIC_SUPABASE_URL` is set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

- [ ] **Step 4: Add Google OAuth redirect URI in Supabase**

In Supabase Dashboard → Authentication → URL Configuration:
- Add `https://your-vercel-domain.vercel.app/auth/callback` to Redirect URLs

- [ ] **Step 5: Test production deploy**

- Open the Vercel URL on your phone
- Sign in with Google
- Add a test card
- Add a test expense in 4 cuotas
- Verify billing month is calculated correctly
- Verify the dashboard shows the installments

- [ ] **Step 6: Install PWA on phone**

- Open in Chrome on Android → three-dot menu → "Add to Home Screen"
- Verify it opens in standalone mode (no browser chrome)

---

## Self-Review Against Spec

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Efectivo / transferencia / tarjeta | Task 10 — ExpenseForm payment method selector |
| Cuotas con generación automática | Task 3 (billing logic) + Task 10 API route |
| Fecha de corte inteligente | Task 3 (calcBillingMonth) + Task 10 API |
| Cierre 27 → gasto 28 → mayo | Task 3 test case |
| Gastos compartidos 50/50 o monto fijo | Task 10 ExpenseForm split section |
| Ingresos / reembolsos | Task 14 |
| Dashboard mensual | Task 12 |
| Cuotas por mes en dashboard | Task 12 (installments section) |
| Filtrar gastos por mes | Task 11 MonthPicker |
| Balance de grupo acumulado | Task 15 |
| Marcar cuota pagada | Task 13 |
| RLS — usuario ve solo sus datos | Task 4 migration |
| PWA installable | Task 16 |
| Deploy Vercel | Task 17 |
| Auth Google OAuth | Task 6 |
| Schema aislado de PADELELO | Task 4 (expenses schema) |

All requirements covered. ✓

**Placeholder scan:** No TBDs or "implement later" patterns present. ✓

**Type consistency:** All types defined in `lib/types.ts` (Task 2), used consistently across queries (Task 5) and components. ✓
