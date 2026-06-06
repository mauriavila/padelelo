import { describe, it, expect } from 'vitest'
import { calcBillingMonth, generateInstallments } from '@/lib/billing'

describe('calcBillingMonth', () => {
  it('returns next month when expense day <= closing day', () => {
    expect(calcBillingMonth('2025-03-15', 27)).toBe('2025-04-01')
  })

  it('returns month+2 when expense day > closing day', () => {
    expect(calcBillingMonth('2025-03-28', 27)).toBe('2025-05-01')
  })

  it('returns next month when expense day equals closing day', () => {
    expect(calcBillingMonth('2025-03-27', 27)).toBe('2025-04-01')
  })

  it('handles year rollover from December', () => {
    expect(calcBillingMonth('2025-12-10', 27)).toBe('2026-01-01')
  })

  it('handles year rollover from December after closing', () => {
    expect(calcBillingMonth('2025-12-28', 27)).toBe('2026-02-01')
  })

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
