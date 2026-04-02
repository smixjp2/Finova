// Shared calculation utilities for consistent data across modules
import type { Transaction as TransactionType, SavingEntry as SavingEntryType, Investment as InvestmentType, Subscription as SubscriptionType } from '@/types'

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthIncome: number
  monthExpenses: number
  monthBalance: number
  savingsRate: number
  totalSaved: number
  totalPortfolio: number
  totalSubscriptions: number
  patrimoine: number
}

/**
 * Calculates comprehensive financial summary
 */
export function calculateFinancialSummary(
  transactions: TransactionType[] = [],
  savings: SavingEntryType[] = [],
  investments: InvestmentType[] = [],
  subscriptions: SubscriptionType[] = []
): FinancialSummary {
  const currentMonth = new Date().toISOString().slice(0, 7)

  // Transactions totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Month-specific
  const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth))
  const monthIncome = monthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthExpenses = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthBalance = monthIncome - monthExpenses

  // Savings
  const totalSaved = savings.reduce(
    (sum, e) => sum + (e.type === 'deposit' ? e.amount : -e.amount),
    0
  )

  // Investments
  const totalPortfolio = investments.reduce(
    (sum, i) => sum + i.current_price * i.quantity,
    0
  )

  // Subscriptions
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.amount, 0)

  // Patrimoine (total wealth)
  const patrimoine = Math.max(0, totalSaved) + totalPortfolio + balance

  // Savings rate
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  return {
    totalIncome,
    totalExpenses,
    balance,
    monthIncome,
    monthExpenses,
    monthBalance,
    savingsRate,
    totalSaved,
    totalPortfolio,
    totalSubscriptions,
    patrimoine,
  }
}

/**
 * Format number as MAD currency
 */
export function formatMAD(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' MAD'
}

/**
 * Format number with decimals
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Get months for charts (last 6 months)
 */
export function getMonthLabels(): string[] {
  const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return MONTHS[d.getMonth()]
  })
}

/**
 * Get data for last 6 months
 */
export interface MonthData {
  month: string
  income: number
  expenses: number
}

export function getLast6Months(transactions: TransactionType[] = []): MonthData[] {
  const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const m = d.toISOString().slice(0, 7)
    const t = transactions.filter(x => x.date.startsWith(m))
    return {
      month: MONTHS[d.getMonth()],
      income: t.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0),
      expenses: t.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
    }
  })
}
