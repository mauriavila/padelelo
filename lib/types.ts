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
  color: string
  closing_day: number
  due_day: number | null
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
  expense_date: string
  is_shared: boolean
  group_id: number | null
  installments_count: number
  billing_month: string | null
  created_at: string
}

export interface Installment {
  id: number
  expense_id: number
  installment_number: number
  due_month: string
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
  income_date: string
  from_user_id: string | null
  group_id: number | null
  expense_id: number | null
  created_at: string
}

export interface ExpenseWithCard extends Expense {
  card: Card | null
}

export interface ExpenseWithParticipants extends Expense {
  card: Card | null
  participants: ExpenseParticipant[]
  installments: Installment[]
}
