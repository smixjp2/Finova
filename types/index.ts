// ─────────────────────────────────────────────────────────────
//  Finova — types globaux
//  Ajouter ici chaque nouveau module au fur et à mesure
// ─────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string          // ISO 'YYYY-MM-DD'
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  limit_amount: number
  color: string
  created_at: string
}

export interface SavingEntry {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  description: string | null
  date: string
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  symbol: string
  name: string | null
  sector: string
  buy_price: number
  quantity: number
  current_price: number
  date: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number          // montant annuel
  category: string
  renewal_date: string    // ISO 'YYYY-MM-DD'
  auto_save: boolean
  created_at: string
}

// Type helper : extrait les données sans les champs DB
export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at'>
export type NewBudget      = Omit<Budget, 'id' | 'user_id' | 'created_at'>
export type NewSavingEntry = Omit<SavingEntry, 'id' | 'user_id' | 'created_at'>
export type NewInvestment  = Omit<Investment, 'id' | 'user_id' | 'created_at'>
export type NewSubscription = Omit<Subscription, 'id' | 'user_id' | 'created_at'>
