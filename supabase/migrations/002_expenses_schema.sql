-- Create dedicated schema (isolated from PADELELO's public schema)
CREATE SCHEMA IF NOT EXISTS expenses;

-- Enable Supabase auth helpers in this schema
GRANT USAGE ON SCHEMA expenses TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA expenses
  GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA expenses
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- expense_groups
CREATE TABLE expenses.expense_groups (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- group_members
CREATE TABLE expenses.group_members (
  group_id   INTEGER NOT NULL REFERENCES expenses.expense_groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- cards
CREATE TABLE expenses.cards (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  bank         TEXT,
  color        TEXT NOT NULL DEFAULT '#7c6df5',
  closing_day  INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 28),
  due_day      INTEGER CHECK (due_day BETWEEN 1 AND 28),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- expenses (main table)
CREATE TYPE expenses.payment_method AS ENUM ('cash', 'transfer', 'credit_card');
CREATE TYPE expenses.expense_category AS ENUM (
  'food', 'transport', 'entertainment', 'health', 'clothing', 'home', 'other'
);

CREATE TABLE expenses.expenses (
  id                 SERIAL PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description        TEXT,
  total_amount       INTEGER NOT NULL CHECK (total_amount > 0),
  category           expenses.expense_category NOT NULL DEFAULT 'other',
  payment_method     expenses.payment_method NOT NULL,
  card_id            INTEGER REFERENCES expenses.cards(id) ON DELETE SET NULL,
  expense_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  is_shared          BOOLEAN NOT NULL DEFAULT false,
  group_id           INTEGER REFERENCES expenses.expense_groups(id) ON DELETE SET NULL,
  installments_count INTEGER NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
  billing_month      DATE,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- installments
CREATE TYPE expenses.installment_status AS ENUM ('pending', 'paid');

CREATE TABLE expenses.installments (
  id                  SERIAL PRIMARY KEY,
  expense_id          INTEGER NOT NULL REFERENCES expenses.expenses(id) ON DELETE CASCADE,
  installment_number  INTEGER NOT NULL CHECK (installment_number >= 1),
  due_month           DATE NOT NULL,
  amount              INTEGER NOT NULL CHECK (amount > 0),
  status              expenses.installment_status NOT NULL DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  UNIQUE (expense_id, installment_number)
);

-- expense_participants
CREATE TYPE expenses.split_type AS ENUM ('equal', 'fixed');

CREATE TABLE expenses.expense_participants (
  id          SERIAL PRIMARY KEY,
  expense_id  INTEGER NOT NULL REFERENCES expenses.expenses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  split_type  expenses.split_type NOT NULL DEFAULT 'equal',
  UNIQUE (expense_id, user_id)
);

-- income
CREATE TYPE expenses.income_category AS ENUM ('reimbursement', 'salary', 'sale', 'other');

CREATE TABLE expenses.income (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description   TEXT,
  amount        INTEGER NOT NULL CHECK (amount > 0),
  category      expenses.income_category NOT NULL DEFAULT 'other',
  income_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  from_user_id  UUID REFERENCES auth.users(id),
  group_id      INTEGER REFERENCES expenses.expense_groups(id),
  expense_id    INTEGER REFERENCES expenses.expenses(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX ON expenses.expenses (user_id, expense_date DESC);
CREATE INDEX ON expenses.expenses (user_id, billing_month);
CREATE INDEX ON expenses.installments (due_month, status);
CREATE INDEX ON expenses.installments (expense_id);
CREATE INDEX ON expenses.income (user_id, income_date DESC);

-- RLS
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

-- expense_participants: own participations (no cross-reference to expenses to avoid RLS infinite recursion)
CREATE POLICY participants_own ON expenses.expense_participants
  FOR ALL USING (user_id = auth.uid());

-- income: own rows only
CREATE POLICY income_own ON expenses.income
  FOR ALL USING (user_id = auth.uid());
