export interface InstallmentInput {
  expenseId: number
  firstBillingMonth: string
  totalAmount: number
  installmentsCount: number
}

export interface InstallmentRow {
  expense_id: number
  installment_number: number
  due_month: string
  amount: number
  status: 'pending'
  paid_at: null
}

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
